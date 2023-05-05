import { VaultV1 } from ".";
import { Migrator } from "../base/migrator";
import { VaultV0 } from "../v0";
import TESTED_VAULTS_V1 from "./v1.vaults";

export class V1Migrator extends Migrator<VaultV1> {
  constructor() {
    super(0, 1, TESTED_VAULTS_V1);
  }

  public migrate = (vaultV0: VaultV0): VaultV1 => {
    if (vaultV0.version !== this.prevVersion)
      throw new Error(
        `V1Migrator: Incorrect prev vault version ${vaultV0.version}`
      );
    const owners = [];
    const importedAccounts = [];

    if ((vaultV0 as any).mnemonics) {
      throw new Error(`Phrase already generated, can't update Vault version`);
    }

    for (let account of vaultV0.importedAccounts) {
      if (account.isOwner || account.isAdmin) {
        owners.push({
          address: account.address,
          seed: account.seed,
        });
      }
      importedAccounts.push({
        address: account.address,
        seed: account.seed,
        commitmentReceipt: account.commitmentReceipt,
        commitmentMapperPubKey: account.commitmentMapperPubKey,
        isSource: true,
        isDestination: true,
      });
    }
    const vaultV1: VaultV1 = {
      name: vaultV0.name,
      importedAccounts: importedAccounts,
      owners: owners,
      autoImportOwners: true,
      version: 1,
    };
    return vaultV1;
  };
}
