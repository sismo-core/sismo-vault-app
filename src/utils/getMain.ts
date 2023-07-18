import { getMinimalIdentifier } from "../utils/getMinimalIdentifier";
import { getMinimalEns } from "../utils/getMinimalEns";
import { Owner, ImportedAccount } from "../services/vault-client";

export const getMain = (importedAccount: ImportedAccount | Owner) => {
  if (!importedAccount) return "";
  if (importedAccount.ens) {
    return importedAccount.ens.name;
  }
  if ((importedAccount as ImportedAccount).profile) {
    return (importedAccount as ImportedAccount).profile.login;
  }
  return importedAccount.identifier;
};

export const getMainMinified = (importedAccount: ImportedAccount | Owner) => {
  if (!importedAccount) return "";
  if (importedAccount.ens) {
    return getMinimalEns(importedAccount.ens.name);
  }
  if ((importedAccount as ImportedAccount).profile) {
    return (importedAccount as ImportedAccount).profile.login;
  }
  return getMinimalIdentifier(importedAccount.identifier);
};
