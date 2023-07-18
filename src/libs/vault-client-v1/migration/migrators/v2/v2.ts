import { VaultV2 } from ".";
import { Migrator } from "../base/migrator";
import { VaultV1 } from "../v1";
import TESTED_VAULTS_V2 from "./v2.vaults";

export class V2Migrator extends Migrator<VaultV2> {
  constructor() {
    super(1, 2, TESTED_VAULTS_V2);
  }

  public migrate = (vaultV1: VaultV1): VaultV2 => {
    if (vaultV1.version !== this.prevVersion)
      throw new Error(`V2Migrator: Incorrect prev vault version ${vaultV1.version}`);

    const sources = vaultV1.importedAccounts
      .filter((account) => account.isSource)
      .map((account) => ({
        identifier: account.address,
        seed: account.seed,
        commitmentReceipt: account.commitmentReceipt,
        commitmentMapperPubKey: account.commitmentMapperPubKey,
        type: "ethereum" as "ethereum",
      }));

    const destinations = vaultV1.importedAccounts
      .filter((account) => account.isDestination)
      .map((account) => ({
        identifier: account.address,
        seed: account.seed,
        commitmentReceipt: account.commitmentReceipt,
        commitmentMapperPubKey: account.commitmentMapperPubKey,
      }));

    const owners = vaultV1.owners.map((account) => ({
      identifier: account.address,
      seed: account.seed,
    }));

    if ((vaultV1 as any).mnemonics) {
      throw new Error(`Phrase already generated, can't update Vault version`);
    }

    const vaultV2: VaultV2 = {
      mnemonics: [],
      owners: owners,
      sources: sources,
      destinations: destinations,
      settings: {
        name: vaultV1.name,
        autoImportOwners: vaultV1.autoImportOwners,
      },
      version: 2,
    };
    return vaultV2;
  };
}
