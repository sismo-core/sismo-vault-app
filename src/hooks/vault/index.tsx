import React, { ReactNode, useContext, useEffect, useMemo, useState, useCallback } from "react";
import env from "../../environment";
import { createActiveSession, deleteActiveSession } from "./utils/createActiveSession";
import {
  ImportedAccount,
  Owner,
  RecoveryKey,
  Vault,
  VaultNamespaceInputs,
  WalletPurpose,
} from "../../services/vault-client";
import { useVaultState } from "./useVaultState";
import { getVaultV2ConnectedOwner } from "./utils/getVaultV2ConnectedOwner";
import { demoOwner } from "../../services/vault-client/client/demo-client.mock";
import { getVaultV1ConnectedOwner } from "./utils/getVaultV1ConnectedOwner";
import { CommitmentMapper } from "../../services/commitment-mapper";
import { ServicesFactory } from "../../services/services-factory";
import { useNotifications } from "../../components/Notifications/provider";
import { formatDate } from "../../utils/formatDate";

type VaultErrorContext = {
  connected: boolean;
  dataSources?: { [accountType: string]: number };
  owners?: number;
  recoveryKeys?: number;
  version?: number;
  createdAt?: string;
  settings?: {
    autoImportOwners?: boolean;
    keepConnected?: boolean;
  };
};

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
  getVaultId: ({ appId, derivationKey }: VaultNamespaceInputs) => Promise<string>;
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
  getErrorContext: () => VaultErrorContext;
};

export const useVault = (): ReactVault => {
  return useContext(SismoVaultContext);
};

export const SismoVaultContext = React.createContext(null);

type Props = {
  services: ServicesFactory;
  isImpersonated?: boolean;
  children: ReactNode;
};

export default function SismoVaultProvider({
  services,
  isImpersonated,
  children,
}: Props): JSX.Element {
  const vaultState = useVaultState();
  const { notificationAdded } = useNotifications();
  const [loadingActiveSession, setLoadingActiveSession] = useState(true);
  const [synchronizing, setSynchronizing] = useState(false);
  const [impersonationErrors, setImpersonationErrors] = useState<string[]>([]);

  const vaultClient = services.getVaultClient();
  const vaultClientV1 = services.getVaultClientV1();
  const vaultSynchronizer = services.getVaultsSynchronizer();

  const getErrorContext = (): VaultErrorContext => {
    if (!Boolean(vaultState.connectedOwner)) {
      return {
        connected: false,
      };
    }
    let dataSources = {};
    for (let account of vaultState.importedAccounts) {
      if (!dataSources[account.type]) {
        dataSources[account.type] = 1;
      } else {
        dataSources[account.type]++;
      }
    }
    return {
      connected: true,
      dataSources,
      owners: vaultState.owners.length,
      recoveryKeys: vaultState.recoveryKeys.length,
      version: vaultState.version,
      settings: {
        autoImportOwners: vaultState.autoImportOwners,
        keepConnected: vaultState.keepConnected,
      },
      createdAt: formatDate(new Date(vaultState.timestamp)),
    };
  };

  useEffect(() => {
    if (impersonationErrors.length === 0) return;
    for (const error of impersonationErrors) {
      notificationAdded(
        {
          text: error,
          type: "error",
        },
        100000
      );
    }
  }, [impersonationErrors, notificationAdded]);

  useEffect(() => {
    const loadActiveSession = async () => {
      if (env.name === "DEMO") {
        setSynchronizing(false);
        setLoadingActiveSession(false);
        return;
      }

      if (isImpersonated) {
        const impersonatedVaultCreator = services.getImpersonatedVaultCreator();
        const { impersonationErrors } = await impersonatedVaultCreator.getImpersonationState();
        if (impersonationErrors.length > 0) {
          setImpersonationErrors(impersonationErrors);
        }
        const { owner, vault } = await impersonatedVaultCreator.create();
        owner && (await vaultState.updateConnectedOwner(owner));
        vault && (await vaultState.updateVaultState(vault));
        setSynchronizing(false);
        setLoadingActiveSession(false);
        return;
      }

      const ownerConnectedV1 = getVaultV1ConnectedOwner();
      const ownerConnectedV2 = getVaultV2ConnectedOwner();

      // Add a loading state which trigger only the first time when the user don't have a VaultV2
      setSynchronizing(true);
      const res = await vaultSynchronizer.sync(ownerConnectedV1, ownerConnectedV2);
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
    let vaultV2 = await vaultClient.unlock(owner.seed);
    let vaultV1 = null;
    if (env.name !== "DEMO" && vaultSynchronizer) {
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
      if (env.name !== "DEMO" && vaultSynchronizer) {
        await vaultSynchronizer.sync(null, owner);
      }
    }
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncVaults = () => {
    if (env.name === "DEMO" || !vaultSynchronizer) {
      console.log("No vault synchronizer");
      return;
    }
    vaultSynchronizer
      .sync(vaultState.connectedOwner, vaultState.connectedOwner)
      .then(async (res) => {
        // Update the vault UI
        if (res) {
          const vault = await vaultClient.unlock(res.owner.seed);
          vaultState.updateVaultState(vault);
        }
      });
  };

  const disconnect = (): void => {
    vaultState.reset();
    vaultClient.lock();
    deleteActiveSession();
  };

  const isVaultExist = async (owner: Owner): Promise<boolean> => {
    const vault = await vaultClient.unlock(owner.seed);
    if (!vault) return false;
    return true;
  };

  const create = async (): Promise<Vault> => {
    return await vaultClient.create();
  };

  const getVaultSecret = useCallback(async (): Promise<string> => {
    return await vaultClient.getVaultSecret();
  }, [vaultClient]);

  const getVaultId = async ({ appId, derivationKey }: VaultNamespaceInputs): Promise<string> => {
    return await vaultClient.getVaultId({ appId, derivationKey });
  };

  const getNextSeed = async (
    purpose: WalletPurpose
  ): Promise<{ seed: string; mnemonic: string; accountNumber: number }> => {
    return await vaultClient.getNextSeed(purpose);
  };

  const generateRecoveryKey = async (name: string): Promise<string> => {
    const vault = await vaultClient.generateRecoveryKey(name);
    syncVaults();
    await vaultState.updateVaultState(vault);
    const mnemonic = vault.mnemonics[0];
    const accountNumber = vault.recoveryKeys.filter((key) => key.mnemonic === mnemonic).length - 1;
    const recoveryKeyGenerated = vault.recoveryKeys.find(
      (recoveryKey) =>
        recoveryKey.mnemonic === mnemonic && recoveryKey.accountNumber === accountNumber
    );

    return recoveryKeyGenerated.key;
  };

  const disableRecoveryKey = async (key: string): Promise<void> => {
    const vault = await vaultClient.disableRecoveryKey(key);
    syncVaults();
    await vaultState.updateVaultState(vault);
  };

  const importAccount = async (account: ImportedAccount): Promise<void> => {
    const vault = await vaultClient.importAccount(account);
    if (account.type === "ethereum" && vaultState.autoImportOwners) {
      if (!vault.owners.find((owner) => owner.identifier === account.identifier)) {
        await addOwner(account);
        return;
      }
    }
    syncVaults();
    await vaultState.updateVaultState(vault);
  };

  const deleteImportedAccount = async (owner: Owner, account: ImportedAccount): Promise<void> => {
    const vault = await vaultClient.deleteImportedAccount(account);
    await vaultState.updateVaultState(vault);
  };

  const addOwner = async (ownerAdded: Owner): Promise<void> => {
    const vault = await vaultClient.addOwner(ownerAdded);
    syncVaults();
    await vaultState.updateVaultState(vault);
  };

  const deleteOwners = async (ownersDeleted: Owner[]): Promise<void> => {
    const vault = await vaultClient.deleteOwners(ownersDeleted);
    await vaultClientV1.deleteOwners(ownersDeleted);
    await vaultState.updateVaultState(vault);
  };

  const setAutoImportOwners = async (autoImportOwners: boolean): Promise<void> => {
    const vault = await vaultClient.setAutoImportOwners(autoImportOwners);
    await vaultState.updateVaultState(vault);
  };

  const setKeepConnected = async (owner: Owner, keepConnected: boolean): Promise<void> => {
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
    await vaultClientV1.unlock(vaultState.connectedOwner.seed);
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
    return services.getCommitmentMapper();
  }, [services]);

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
        getErrorContext,
        getVaultSecret,
        getVaultId,
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
