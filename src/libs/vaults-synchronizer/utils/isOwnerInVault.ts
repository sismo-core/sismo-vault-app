import { Vault } from "../../vault-client-v1";

export const isOwnerInVault = (key: string, vault: Vault): boolean => {
  return Boolean(vault.owners.find((owner) => owner.seed === key));
};
