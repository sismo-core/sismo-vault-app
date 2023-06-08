import { Vault, VaultClient as VaultClientV1 } from "../../vault-client-v1";
import { VaultClient as VaultClientV2 } from "../../vault-client";

/*
 * Return a seed of seed which have a Vault in the corresponding vaultClient
 */
export const getExistingVaultSeed = async (
  vault: Vault,
  vaultClient: VaultClientV1 | VaultClientV2
): Promise<string> => {
  let seed = null;
  for (let owner of vault.owners) {
    let exist = await vaultClient.isVault(owner.seed);
    if (exist) {
      seed = owner.seed;
      break;
    }
  }
  if (!seed) {
    for (let recoveryKey of vault.recoveryKeys) {
      let exist = await vaultClient.isVault(recoveryKey.key);
      if (exist) {
        seed = recoveryKey.key;
        break;
      }
    }
  }
  return seed;
};
