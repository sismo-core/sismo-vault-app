import { ErrorContext } from "../../../services/logger-service/interfaces/logger-provider";
import { VaultClient } from "../../../services/vault-client";
import { formatDate } from "../../../utils/formatDate";

export type VaultErrorContext = {};

export const getVaultErrorContext = async ({
  vaultClient,
}: {
  vaultClient: VaultClient;
}): Promise<ErrorContext> => {
  const vault = await vaultClient.load();
  if (!vault)
    return {
      connected: false,
    };
  let dataSources = {};
  if (vault.importedAccounts)
    for (let account of vault.importedAccounts) {
      if (!dataSources[account.type]) {
        dataSources[account.type] = 1;
      } else {
        dataSources[account.type]++;
      }
    }
  return {
    dataSources,
    owners: vault?.owners?.length,
    recoveryKeys: vault?.recoveryKeys?.length,
    version: vault?.version,
    settings: {
      autoImportOwners: vault?.settings?.autoImportOwners,
      keepConnected: vault?.settings?.keepConnected,
    },
    createdAt: formatDate(new Date(vault.timestamp)),
  };
};
