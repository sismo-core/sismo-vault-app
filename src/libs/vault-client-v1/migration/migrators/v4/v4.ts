import { ImportedAccount, RecoveryKey, VaultV4 } from ".";
import { VaultV3 } from "../v3";
import { Migrator } from "../base/migrator";
import TESTED_VAULTS_V4 from "./v4.vaults";

export class V4Migrator extends Migrator<VaultV4> {
  constructor() {
    super(3, 4, TESTED_VAULTS_V4);
  }

  public migrate = (vaultV3: VaultV3, forceTimestamp?: number): VaultV4 => {
    if (vaultV3.version !== this.prevVersion)
      throw new Error(`V4Migrator: Incorrect prev vault version ${vaultV3.version}`);

    let importedAccounts: ImportedAccount[] = vaultV3.sources;

    for (let destination of vaultV3.destinations) {
      const account = importedAccounts.find(
        (account) => account.identifier === destination.identifier
      );
      if (!account) {
        importedAccounts.push({
          identifier: destination.identifier,
          seed: destination.seed,
          commitmentReceipt: destination.commitmentReceipt,
          commitmentMapperPubKey: destination.commitmentMapperPubKey,
          type: "ethereum",
          timestamp: destination.timestamp,
        });
      }
    }

    const recoveryKeys: RecoveryKey[] = vaultV3.backupKeys
      ? vaultV3.backupKeys.map((recoveryKey) => {
          return {
            key: recoveryKey.key,
            mnemonic: recoveryKey.mnemonic,
            accountNumber: recoveryKey.accountNumber,
            valid: recoveryKey.valide,
            name: recoveryKey.name,
            timestamp: recoveryKey.timestamp,
          };
        })
      : [];

    const vaultV4: VaultV4 = {
      mnemonics: vaultV3.mnemonics,
      owners: vaultV3.owners,
      importedAccounts: importedAccounts,
      settings: vaultV3.settings,
      recoveryKeys: recoveryKeys,
      timestamp: forceTimestamp ? forceTimestamp : Date.now(),
      version: 4,
    };
    return vaultV4;
  };
}
