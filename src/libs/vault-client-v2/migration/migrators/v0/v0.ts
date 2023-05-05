import { Migrator } from "../base/migrator";
import { VaultV0 } from ".";
import TESTED_VAULTS_V0 from "./v0.vaults";

export class V0Migrator extends Migrator<VaultV0> {
  constructor() {
    super(-1, 0, TESTED_VAULTS_V0);
  }
  public migrate = (vault: any): VaultV0 => {
    return vault;
  };
}
