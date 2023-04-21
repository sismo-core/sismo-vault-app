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
  CommitmentMapper,
  ImportedAccount,
  Owner,
  RecoveryKey,
  Vault,
  VaultClient,
  WalletPurpose,
} from "../vault-client";
import { AwsStore } from "../vault-client/stores/aws-store";
import { useVaultState } from "./useVaultState";
import { getSeedActiveSession } from "./utils/getSeedActiveSession";
import { LocalStore } from "../vault-client/stores/local-store";
import { VaultClientDemo } from "../vault-client/client/client-demo";
import { demoOwner } from "../vault-client/client/client-demo.mock";
import { CommitmentMapperDemo } from "../vault-client/commitment-mapper/commitment-mapper.demo";

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
  vaultUrl: string;
  children: ReactNode;
};

export default function SismoVaultProvider({
  vaultUrl,
  children,
}: Props): JSX.Element {
  const vaultClient = useMemo(() => {
    if (!vaultUrl) return;
    const awsStore = new AwsStore({ vaultUrl: vaultUrl });
    if (env.name === "DEMO") {
      const localStore = new LocalStore();
      const vault = new VaultClientDemo(localStore);
      return vault;
    }
    return new VaultClient(awsStore);
  }, [vaultUrl]);
  const vaultState = useVaultState();

  const connect = useCallback(async (owner: Owner): Promise<boolean> => {
    const vault = await vaultClient.unlock(owner.seed);
    if (!vault) return false;
    await Promise.all([
      vaultState.updateConnectedOwner(owner),
      vaultState.updateVaultState(vault),
    ]);
    if (vault.settings.keepConnected) {
      console.log("create active session");
      createActiveSession(owner, 24 * 30 * 24);
    }
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const disconnect = (): void => {
    vaultState.reset();
    vaultClient.lock();
    deleteActiveSession();
  };

  const [loadingActiveSession, setLoadingActiveSession] = useState(true);
  useEffect(() => {
    const owner = getSeedActiveSession();
    if (!owner) {
      setTimeout(() => {
        setLoadingActiveSession(false);
      }, 100);
      return;
    }
    if (!owner) return;
    const loadActiveSession = async (owner: Owner) => {
      await connect(owner);
      setTimeout(() => {
        setLoadingActiveSession(false);
      }, 100);
    };
    loadActiveSession(owner);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isVaultExist = async (owner: Owner): Promise<boolean> => {
    const vault = await vaultClient.unlock(owner.seed);
    if (!vault) return false;
    return true;
  };

  const create = async (): Promise<Vault> => {
    return await vaultClient.create();
  };

  const getVaultSecret = async (): Promise<string> => {
    return await vaultClient.getVaultSecret();
  };

  const getNextSeed = async (
    purpose: WalletPurpose
  ): Promise<{ seed: string; mnemonic: string; accountNumber: number }> => {
    return await vaultClient.getNextSeed(purpose);
  };

  const generateRecoveryKey = async (name: string): Promise<string> => {
    const vault = await vaultClient.generateRecoveryKey(name);
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
    const vault = await vaultClient.disableRecoveryKey(key);
    await vaultState.updateVaultState(vault);
  };

  const importAccount = async (account: ImportedAccount): Promise<void> => {
    const vault = await vaultClient.importAccount(account);
    if (account.type === "ethereum" && vaultState.autoImportOwners) {
      if (
        !vault.owners.find((owner) => owner.identifier === account.identifier)
      ) {
        await addOwner(account);
        return;
      }
    }
    await vaultState.updateVaultState(vault);
  };

  const deleteImportedAccount = async (
    owner: Owner,
    account: ImportedAccount
  ): Promise<void> => {
    const vault = await vaultClient.deleteImportedAccount(account);
    await vaultState.updateVaultState(vault);
  };

  const addOwner = async (ownerAdded: Owner): Promise<void> => {
    const vault = await vaultClient.addOwner(ownerAdded);
    await vaultState.updateVaultState(vault);
  };

  const deleteOwners = async (ownersDeleted: Owner[]): Promise<void> => {
    const vault = await vaultClient.deleteOwners(ownersDeleted);
    await vaultState.updateVaultState(vault);
  };

  const setAutoImportOwners = async (
    autoImportOwners: boolean
  ): Promise<void> => {
    const vault = await vaultClient.setAutoImportOwners(autoImportOwners);
    await vaultState.updateVaultState(vault);
  };

  const setKeepConnected = async (
    owner: Owner,
    keepConnected: boolean
  ): Promise<void> => {
    const vault = await vaultClient.setKeepConnected(keepConnected);
    if (!keepConnected) {
      deleteActiveSession();
    } else {
      createActiveSession(owner, 24 * 30 * 3);
    }
    await vaultState.updateVaultState(vault);
  };

  const updateName = async (name: string): Promise<void> => {
    const vault = await vaultClient.updateName(name);
    await vaultState.updateVaultState(vault);
  };

  const deleteVault = async (): Promise<void> => {
    await vaultClient.delete();
    await vaultState.reset();
  };

  // Connect to vault on demo mode
  useEffect(() => {
    if (vaultClient && env.name === "DEMO") {
      connect(demoOwner);
    }
  }, [connect, vaultClient]);

  const commitmentMapper = useMemo(() => {
    if (env.name === "DEMO") {
      return new CommitmentMapperDemo({
        url: env.commitmentMapperUrl,
      });
    }

    return new CommitmentMapper({
      url: env.commitmentMapperUrl,
    });
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
