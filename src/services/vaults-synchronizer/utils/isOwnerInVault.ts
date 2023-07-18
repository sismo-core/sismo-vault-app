import { Vault } from "../../vault-client-v1";

export const isOwnerInVault = (identifier: string, vault: Vault): boolean => {
  return Boolean(vault.owners.find((owner) => owner.identifier === identifier));
};
