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
      const ownerConnectedV1 = getVaultV1ConnectedOwner();
      const ownerConnectedV2 = getVaultV2ConnectedOwner();

      const owner = ownerConnectedV2 ?? ownerConnectedV1;
      // Synch vaults V1 and V2 on the same owner
      vaultSynchronizer
        .sync(ownerConnectedV1, ownerConnectedV2)
        .then(async (res) => {
          // Update the vault UI
          const vault = await vaultClientV2.unlock(res.owner.seed);
          vaultState.updateVaultState(vault);
        });
      if (owner) connect(owner);

      setTimeout(() => {
        setLoadingActiveSession(false);
      }, 100);
    };
    loadActiveSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = useCallback(async (owner: Owner): Promise<boolean> => {
    const vault = await vaultClientV2.unlock(owner.seed);
    if (!vault) return false;
    await Promise.all([
      vaultState.updateConnectedOwner(owner),
      vaultState.updateVaultState(vault),
    ]);
    if (vault.settings.keepConnected) {
      createActiveSession(owner, 24 * 30 * 24);
    }
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    await vaultState.updateVaultState(vault);
    vaultSynchronizer
      .sync(vaultState.connectedOwner, vaultState.connectedOwner)
      .then(async (res) => {
        // Update the vault UI
        const vault = await vaultClientV2.unlock(res.owner.seed);
        vaultState.updateVaultState(vault);
      });
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
    vaultSynchronizer
      .sync(vaultState.connectedOwner, vaultState.connectedOwner)
      .then(async (res) => {
        // Update the vault UI
        const vault = await vaultClientV2.unlock(res.owner.seed);
        vaultState.updateVaultState(vault);
      });
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
    vaultSynchronizer
      .sync(vaultState.connectedOwner, vaultState.connectedOwner)
      .then(async (res) => {
        // Update the vault UI
        const vault = await vaultClientV2.unlock(res.owner.seed);
        vaultState.updateVaultState(vault);
      });
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
    await vaultState.updateVaultState(vault);
    vaultSynchronizer
      .sync(vaultState.connectedOwner, vaultState.connectedOwner)
      .then(async (res) => {
        // Update the vault UI
        const vault = await vaultClientV2.unlock(res.owner.seed);
        vaultState.updateVaultState(vault);
      });
  };

  const deleteOwners = async (ownersDeleted: Owner[]): Promise<void> => {
    const vault = await vaultClientV2.deleteOwners(ownersDeleted);
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
