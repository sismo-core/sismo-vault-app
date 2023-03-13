import { overrideEligibleGroupDataFormatter } from "../../zk-connect/utils";
import { Cache } from "../caches";
import { HydraS1OffchainProver } from "../provers/hydra-s1-offchain-prover";
import { GetEligibilityInputs, OffchainProofRequest } from "../provers/types";

export class SismoClient {
  public prover: HydraS1OffchainProver;

  constructor({ cache }: { cache: Cache }) {
    this.prover = new HydraS1OffchainProver({ cache });
  }

  /*****************************************************************/
  /************************ ELIGIBILITY ****************************/
  /*****************************************************************/
  public async getEligibility({
    accounts,
    groupId,
    groupTimestamp,
    comparator,
    requestedValue,
    devAddresses,
  }: GetEligibilityInputs) {
    if (devAddresses) {
      console.warn(
        `Using devAddresses to check eligibility for groupId ${groupId}!`,
        devAddresses
      );
      const lowerCaseOverrideGroupData =
        overrideEligibleGroupDataFormatter(devAddresses);
      const eligibleAccount = accounts.find(
        (account) => lowerCaseOverrideGroupData[account.toLowerCase()]
      );
      if (!eligibleAccount) {
        return null;
      }
      return {
        identifier: eligibleAccount,
        value: devAddresses[eligibleAccount] ?? 1,
      };
    }

    const accountData = await this.prover.getEligibility({
      accounts,
      groupId,
      groupTimestamp,
      comparator,
      requestedValue,
    });
    return accountData;
  }

  public async generateOffchainProof({
    appId,
    source,
    vaultSecret,
    namespace,
    groupId,
    groupTimestamp,
    requestedValue,
    comparator,
    devAddresses,
  }: OffchainProofRequest) {
    return await this.prover.generateProof({
      appId,
      source,
      vaultSecret,
      namespace,
      groupId,
      groupTimestamp,
      requestedValue,
      comparator,
      devAddresses,
    });
  }
}
