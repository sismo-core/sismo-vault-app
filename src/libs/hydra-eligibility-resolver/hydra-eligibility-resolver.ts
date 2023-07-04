import { BigNumber } from "ethers";
import { GroupTimestamp } from "../hydra-provers/types";
import { RegistryTreeReaderBase } from "../registry-tree-readers/types";

export class HydraEligibilityResolver {
  private _registryTreeReader: RegistryTreeReaderBase;

  constructor({ registryTreeReader }: { registryTreeReader: RegistryTreeReaderBase }) {
    this._registryTreeReader = registryTreeReader;
  }

  public async getEligibleValue({
    identifier,
    groupId,
    groupTimestamp,
  }: {
    identifier: string;
    groupId: string;
    groupTimestamp?: GroupTimestamp;
  }): Promise<string> {
    if (!groupTimestamp) groupTimestamp = "latest";

    const eligibleAccountsTreeData = await this._registryTreeReader.getAccountsTreeEligibility({
      accounts: [identifier],
      groupId,
      timestamp: groupTimestamp,
    });

    if (eligibleAccountsTreeData && Object.keys(eligibleAccountsTreeData)[0]) {
      const identifier = Object.keys(eligibleAccountsTreeData)[0];
      return BigNumber.from(eligibleAccountsTreeData[identifier]).toString();
    }

    return null;
  }
}
