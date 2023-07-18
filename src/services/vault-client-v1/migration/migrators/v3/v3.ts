import { Source, VaultV3, Owner, Destination } from ".";
import { Migrator } from "../base/migrator";
import { VaultV2 } from "../v2";
import TESTED_VAULTS_V3 from "./v3.vaults";

export class V3Migrator extends Migrator<VaultV3> {
  constructor() {
    super(2, 3, TESTED_VAULTS_V3);
  }

  public migrate = (vaultV2: VaultV2, forceTimestamp?: number): VaultV3 => {
    if (vaultV2.version !== this.prevVersion)
      throw new Error(`V3Migrator: Incorrect prev vault version ${vaultV2.version}`);

    const sources: Source[] = vaultV2.sources.map((source) => ({
      ...source,
      timestamp: forceTimestamp ? forceTimestamp : Date.now(),
    }));

    const destinations: Destination[] = vaultV2.destinations.map((destination) => ({
      ...destination,
      timestamp: forceTimestamp ? forceTimestamp : Date.now(),
    }));

    const owners: Owner[] = vaultV2.owners.map((owner) => ({
      ...owner,
      timestamp: forceTimestamp ? forceTimestamp : Date.now(),
    }));

    const vaultV3: VaultV3 = {
      mnemonics: vaultV2.mnemonics,
      owners: owners,
      sources: sources,
      destinations: destinations,
      settings: {
        ...vaultV2.settings,
        keepConnected: true,
      },
      backupKeys: [],
      timestamp: forceTimestamp ? forceTimestamp : Date.now(),
      version: 3,
    };
    return vaultV3;
  };
}
