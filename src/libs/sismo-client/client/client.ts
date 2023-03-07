import { ImportedAccount } from "../../vault-client";
import { Cache } from "../caches";
import { HydraS1OffchainProver } from "../provers/hydra-s1-offchain-prover";

export class SismoClient {
  public prover: HydraS1OffchainProver;

  constructor({ cache }: { cache: Cache; chainIds: number[] }) {
    this.prover = new HydraS1OffchainProver({ cache });
  }

  /*****************************************************************/
  /************************ ELIGIBILITY ****************************/
  /*****************************************************************/
  public async getEligibility({
    accounts,
    groupId,
    timestamp,
    acceptHigherValues,
    value,
  }: {
    accounts: string[];
    groupId: string;
    timestamp: number | "latest";
    acceptHigherValues: boolean;
    value: number | "MAX";
  }) {
    const accountData = await this.prover.getEligibility({
      accounts,
      groupId,
      timestamp,
      acceptHigherValues,
      value,
    });
    return accountData;
  }

  public async generateOffchainProof({
    appId,
    serviceName,
    acceptHigherValues,
    value,
    source,
    groupId,
    groupTimestamp,
  }: {
    appId: string;
    serviceName: string;
    acceptHigherValues: boolean;
    value: number | "MAX";
    source: ImportedAccount;
    groupId: string;
    groupTimestamp: number | "latest";
  }) {
    return await this.prover.generateProof({
      appId,
      serviceName,
      acceptHigherValues,
      value,
      source,
      groupId,
      groupTimestamp,
    });
  }
}
