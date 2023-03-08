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
  }: GetEligibilityInputs) {
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
    });
  }
}
