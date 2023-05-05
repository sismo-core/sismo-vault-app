import { Vault } from "../../vault-client-v1";

export const isRecoveryKeyInVault = (key: string, vault: Vault): boolean => {
  return Boolean(
    vault.recoveryKeys.find((recoveryKey) => recoveryKey.key === key)
  );
};
