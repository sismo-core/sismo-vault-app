import React, {
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import env from "../../environment";
import {
  createActiveSession,
  deleteActiveSession,
} from "./utils/createActiveSession";
import {
  ImportedAccount,
  Owner,
  RecoveryKey,
  Vault,
  VaultClient as VaultClientV2,
  WalletPurpose,
} from "../vault-client-v2";
import { VaultClient as VaultClientV1 } from "../vault-client-v1";
import { AwsStore } from "../vault-client-v2/stores/aws-store";
import { useVaultState } from "./useVaultState";
import { getVaultV2ConnectedOwner } from "./utils/getVaultV2ConnectedOwner";
import { LocalStore } from "../vault-client-v2/stores/local-store";
import { VaultClientDemo } from "../vault-client-v2/client/client-demo";
import { demoOwner } from "../vault-client-v2/client/client-demo.mock";
import { CommitmentMapperDemo } from "../commitment-mapper/commitment-mapper-demo";
import { getVaultV1ConnectedOwner } from "./utils/getVaultV1ConnectedOwner";
import { VaultsSynchronizer } from "../vaults-synchronizer";
import { CommitmentMapper, CommitmentMapperAWS } from "../commitment-mapper";

type ReactVault = {
  mnemonics: string[];
  vaultName: string;
  loadingActiveSession: boolean;
  autoImportOwners: boolean;
  keepConnected: boolean;
  importedAccounts: ImportedAccount[];
  owners: Owner[];
  connectedOwner: Owner;
  isConnected: boolean;
  deletable: boolean;
  recoveryKeys: RecoveryKey[];
  commitmentMapper: CommitmentMapper;
  synchronizing: boolean;
  getVaultSecret: () => Promise<string>;
  disconnect: () => void;
  connect: (owner: Owner) => Promise<boolean>;
  isVaultExist: (owner: Owner) => Promise<boolean>;
  getNextSeed: (
    purpose: WalletPurpose
  ) => Promise<{ seed: string; mnemonic: string; accountNumber: number }>;
  generateRecoveryKey: (name?: string) => Promise<string>;
  disableRecoveryKey: (key: string) => Promise<string>;
  create: () => Promise<Vault>;
  importAccount: (account: ImportedAccount) => Promise<void>;
  deleteImportedAccount: (account: ImportedAccount) => Promise<void>;
  addOwner: (ownerAdded: Owner) => Promise<Vault>;
  deleteOwners: (ownersDeleted: Owner[]) => Promise<void>;
  setAutoImportOwners: (autoImportOwners: boolean) => Promise<void>;
  updateName: (name: string) => Promise<void>;
  deleteVault: () => Promise<void>;
  setKeepConnected: (owner: Owner, keepConnected: boolean) => Promise<void>;
};

export const useVault = (): ReactVault => {
  return useContext(SismoVaultContext);
};

export const SismoVaultContext = React.createContext(null);

type Props = {
  vaultV2Url: string;
  vaultV1Url: string;
  children: ReactNode;
};

export default function SismoVaultProvider({
  vaultV2Url,
  vaultV1Url,
  children,
}: Props): JSX.Element {
  const vaultState = useVaultState();
  const [loadingActiveSession, setLoadingActiveSession] = useState(true);
  const [synchronizing, setSynchronizing] = useState(false);

  const vaultClientV2 = useMemo(() => {
    if (!vaultV2Url) return;
    if (env.name === "DEMO") return new VaultClientDemo(new LocalStore());
    return new VaultClientV2(new AwsStore({ vaultUrl: vaultV2Url }));
  }, [vaultV2Url]);

  const vaultClientV1 = useMemo(() => {
    if (!vaultV1Url) return;
    if (env.name === "DEMO") return null;
    return new VaultClientV1(new AwsStore({ vaultUrl: vaultV1Url }));
  }, [vaultV1Url]);

  const vaultSynchronizer = new VaultsSynchronizer({
    commitmentMapperV1: new CommitmentMapperAWS({
      url: env.commitmentMapperUrlV1,
    }),
    commitmentMapperV2: new CommitmentMapperAWS({
      url: env.commitmentMapperUrlV2,
    }),
    vaultClientV2,
    vaultClientV1,
  });

  useEffect(() => {
    const loadActiveSession = async () => {
      if (env.name === "DEMO") {
        setSynchronizing(false);
        setLoadingActiveSession(false);
        return;
      }
      const ownerConnectedV1 = getVaultV1ConnectedOwner();
      const ownerConnectedV2 = getVaultV2ConnectedOwner();

      // Add a loading state which trigger only the first time when the user don't have a VaultV2
      setSynchronizing(true);
      const res = await vaultSynchronizer.sync(
        ownerConnectedV1,
        ownerConnectedV2
      );
      if (res && res.vault && !Boolean(vaultState.connectedOwner)) {
        await Promise.all([
          vaultState.updateConnectedOwner(res.owner),
          vaultState.updateVaultState(res.vault),
        ]);
        if (res.vault.settings.keepConnected) {
          createActiveSession(res.owner, 24 * 30 * 24);
        }
      }
      setLoadingActiveSession(false);
      setSynchronizing(false);
    };
    loadActiveSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = useCallback(async (owner: Owner): Promise<boolean> => {
    let vaultV2 = await vaultClientV2.unlock(owner.seed);
    let vaultV1 = null;
    if (env.name !== "DEMO") {
      vaultV1 = await vaultClientV1.unlock(owner.seed);
      if (!vaultV2) {
        if (vaultV1) {
          const { vault } = await vaultSynchronizer.sync(owner, null);
          vaultV2 = vault;
        } else {
          return false;
        }
      }
    }
    await Promise.all([
      vaultState.updateConnectedOwner(owner),
      vaultState.updateVaultState(vaultV2),
    ]);
    if (vaultV2.settings.keepConnected) {
      createActiveSession(owner, 24 * 30 * 24);
    }
    if (vaultV2 && !vaultV1) {
      if (env.name !== "DEMO") {
        await vaultSynchronizer.sync(null, owner);
      }
    }
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncVaults = () => {
    if (env.name === "DEMO") {
      return;
    }
    vaultSynchronizer
      .sync(vaultState.connectedOwner, vaultState.connectedOwner)
      .then(async (res) => {
        // Update the vault UI
        if (res) {
          const vault = await vaultClientV2.unlock(res.owner.seed);
          vaultState.updateVaultState(vault);
        }
      });
  };

  const disconnect = (): void => {
    vaultState.reset();
    vaultClientV2.lock();
    deleteActiveSession();
  };

  const isVaultExist = async (owner: Owner): Promise<boolean> => {
    const vault = await vaultClientV2.unlock(owner.seed);
    if (!vault) return false;
    return true;
  };

  const create = async (): Promise<Vault> => {
    return await vaultClientV2.create();
  };

  const getVaultSecret = async (): Promise<string> => {
    return await vaultClientV2.getVaultSecret();
  };

  const getNextSeed = async (
    purpose: WalletPurpose
  ): Promise<{ seed: string; mnemonic: string; accountNumber: number }> => {
    return await vaultClientV2.getNextSeed(purpose);
  };

  const generateRecoveryKey = async (name: string): Promise<string> => {
    const vault = await vaultClientV2.generateRecoveryKey(name);
    syncVaults();
    await vaultState.updateVaultState(vault);
    const mnemonic = vault.mnemonics[0];
    const accountNumber =
      vault.recoveryKeys.filter((key) => key.mnemonic === mnemonic).length - 1;
    const recoveryKeyGenerated = vault.recoveryKeys.find(
      (recoveryKey) =>
        recoveryKey.mnemonic === mnemonic &&
        recoveryKey.accountNumber === accountNumber
    );

    return recoveryKeyGenerated.key;
  };

  const disableRecoveryKey = async (key: string): Promise<void> => {
    const vault = await vaultClientV2.disableRecoveryKey(key);
    syncVaults();
    await vaultState.updateVaultState(vault);
  };

  const importAccount = async (account: ImportedAccount): Promise<void> => {
    const vault = await vaultClientV2.importAccount(account);
    if (account.type === "ethereum" && vaultState.autoImportOwners) {
      if (
        !vault.owners.find((owner) => owner.identifier === account.identifier)
      ) {
        await addOwner(account);
        return;
      }
    }
    syncVaults();
    await vaultState.updateVaultState(vault);
  };

  const deleteImportedAccount = async (
    owner: Owner,
    account: ImportedAccount
  ): Promise<void> => {
    const vault = await vaultClientV2.deleteImportedAccount(account);
    await vaultState.updateVaultState(vault);
  };

  const addOwner = async (ownerAdded: Owner): Promise<void> => {
    const vault = await vaultClientV2.addOwner(ownerAdded);
    syncVaults();
    await vaultState.updateVaultState(vault);
  };

  const deleteOwners = async (ownersDeleted: Owner[]): Promise<void> => {
    const vault = await vaultClientV2.deleteOwners(ownersDeleted);
    await vaultClientV1.deleteOwners(ownersDeleted);
    await vaultState.updateVaultState(vault);
  };

  const setAutoImportOwners = async (
    autoImportOwners: boolean
  ): Promise<void> => {
    const vault = await vaultClientV2.setAutoImportOwners(autoImportOwners);
    await vaultState.updateVaultState(vault);
  };

  const setKeepConnected = async (
    owner: Owner,
    keepConnected: boolean
  ): Promise<void> => {
    const vault = await vaultClientV2.setKeepConnected(keepConnected);
    if (!keepConnected) {
      deleteActiveSession();
    } else {
      createActiveSession(owner, 24 * 30 * 3);
    }
    await vaultState.updateVaultState(vault);
  };

  const updateName = async (name: string): Promise<void> => {
    const vault = await vaultClientV2.updateName(name);
    await vaultClientV1.unlock(vaultState.connectedOwner.seed);
    await vaultState.updateVaultState(vault);
  };

  const deleteVault = async (): Promise<void> => {
    await vaultClientV2.delete();
    await vaultState.reset();
  };

  // Connect to vault on demo mode
  useEffect(() => {
    if (vaultClientV2 && env.name === "DEMO") {
      connect(demoOwner);
    }
  }, [connect, vaultClientV2]);

  const commitmentMapper = useMemo(() => {
    if (env.name === "DEMO") return new CommitmentMapperDemo();
    return new CommitmentMapperAWS({ url: env.commitmentMapperUrlV2 });
  }, []);

  return (
    <SismoVaultContext.Provider
      value={{
        loadingActiveSession,
        commitmentMapper,
        keepConnected: vaultState.keepConnected,
        vaultName: vaultState.vaultName,
        autoImportOwners: vaultState.autoImportOwners,
        importedAccounts: vaultState.importedAccounts,
        owners: vaultState.owners,
        connectedOwner: vaultState.connectedOwner,
        isConnected: Boolean(vaultState.connectedOwner),
        deletable: vaultState.deletable,
        recoveryKeys: vaultState.recoveryKeys,
        synchronizing,
        getVaultSecret,
        disableRecoveryKey,
        generateRecoveryKey,
        disconnect,
        create,
        getNextSeed,
        connect,
        isVaultExist,
        importAccount,
        deleteImportedAccount,
        addOwner,
        deleteOwners,
        setAutoImportOwners,
        updateName,
        deleteVault,
        setKeepConnected,
      }}
    >
      {children}
    </SismoVaultContext.Provider>
  );
}
