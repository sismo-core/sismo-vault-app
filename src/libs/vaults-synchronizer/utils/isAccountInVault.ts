import { Vault } from "../../vault-client-v1";

export const isAccountInVault = (identifier: string, vault: Vault): boolean => {
  return Boolean(
    vault.importedAccounts.find(
      (importedAccount) => importedAccount.identifier === identifier
    )
  );
};
