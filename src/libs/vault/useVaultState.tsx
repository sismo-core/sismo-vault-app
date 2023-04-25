import { useState } from "react";
import { ImportedAccount, Owner, RecoveryKey, Vault } from "../vault-client-v2";
import { useWallet } from "../wallet";

export type VaultState = {
  vaultName: string;
  autoImportOwners: boolean;
  keepConnected: boolean;
  importedAccounts: ImportedAccount[];
  owners: Owner[];
  connectedOwner: Owner;
  recoveryKeys: RecoveryKey[];
  deletable: boolean;
  updateVaultState: (vault: Vault) => Promise<void>;
  updateConnectedOwner: (owner: Owner) => Promise<void>;
  reset: () => void;
};

export const useVaultState = (): VaultState => {
  const wallet = useWallet();
  const [vaultName, setVaultName] = useState(null);
  const [autoImportOwners, setAutoImportOwners] = useState<boolean>(null);
  const [keepConnected, setKeepConnected] = useState<boolean>(null);
  const [importedAccounts, setImportedAccounts] =
    useState<ImportedAccount[]>(null);
  const [recoveryKeys, setRecoveryKeys] = useState<RecoveryKey[]>(null);
  const [owners, setOwners] = useState<Owner[]>(null);
  const [connectedOwner, setConnectedOwner] = useState<Owner>(null);
  const [deletable, setDeletable] = useState(false);

  const updateVaultName = async (vault: Vault): Promise<void> => {
    if (vault.settings.name !== vaultName) {
      setVaultName(vault.settings.name);
    }
  };

  const updateKeepConnected = async (vault: Vault): Promise<void> => {
    if (vault.settings.keepConnected !== keepConnected) {
      setKeepConnected(vault.settings.keepConnected);
    }
  };

  const updateAutoImportOwners = async (vault: Vault): Promise<void> => {
    if (vault.settings.autoImportOwners !== autoImportOwners) {
      setAutoImportOwners(vault.settings.autoImportOwners);
    }
  };

  const updateRecoveryKeys = async (vault: Vault): Promise<void> => {
    if (
      recoveryKeys === null ||
      vault.recoveryKeys.length !== recoveryKeys.length ||
      !vault.recoveryKeys.every((val, index) => val === recoveryKeys[index])
    ) {
      setRecoveryKeys(vault.recoveryKeys);
    }
  };

  const addEns = async (importedAccounts) => {
    const _accountsToUpdate = [...importedAccounts];

    const ensList = await Promise.all(
      _accountsToUpdate.map((account) => {
        if (account.ens) return account.ens;
        return wallet.getEns(account.identifier);
      })
    );

    for (let [index, ens] of ensList.entries()) {
      if (ens) {
        _accountsToUpdate[index] = {
          ..._accountsToUpdate[index],
          ens,
        };
      }
    }
    return _accountsToUpdate;
  };

  const updateImportedAccountsState = async (vault: Vault): Promise<void> => {
    if (
      importedAccounts === null ||
      vault.importedAccounts.length !== importedAccounts.length ||
      !vault.importedAccounts.every((source) =>
        importedAccounts.find((el) => el.identifier === source.identifier)
      )
    ) {
      let _importedAccounts = await addEns(vault.importedAccounts);
      setImportedAccounts(_importedAccounts);
    }
  };

  const updateOwnersState = async (vault: Vault): Promise<void> => {
    if (
      owners === null ||
      vault.owners.length !== owners.length ||
      !vault.owners.every((source) =>
        owners.find((el) => el.identifier === source.identifier)
      )
    ) {
      const _owners = await addEns(vault.owners);
      setOwners(_owners);
    }
  };

  const updateVaultState = async (vault: Vault) => {
    if (!vault) return;
    if (vault.mnemonics && vault.mnemonics.length === 0) setDeletable(true);
    await Promise.all([
      updateImportedAccountsState(vault),
      updateOwnersState(vault),
      updateVaultName(vault),
      updateAutoImportOwners(vault),
      updateRecoveryKeys(vault),
      updateKeepConnected(vault),
    ]);
  };

  const updateConnectedOwner = async (owner: Owner): Promise<void> => {
    const ens = await wallet.getEns(owner.identifier);
    if (ens) {
      owner = {
        ...owner,
        ens,
      };
    }
    setConnectedOwner(owner);
  };

  const reset = (): void => {
    setDeletable(false);
    setVaultName(null);
    setAutoImportOwners(null);
    setImportedAccounts(null);
    setOwners([]);
    setConnectedOwner(null);
  };

  return {
    vaultName,
    autoImportOwners,
    importedAccounts,
    owners,
    connectedOwner,
    deletable,
    recoveryKeys,
    keepConnected,
    updateVaultState,
    updateConnectedOwner,
    reset,
  };
};
