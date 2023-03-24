import { BigNumber } from "ethers";
import { ImportedAccount } from "../../../vault-client";
import { overrideEligibleGroupDataFormatter } from "../../../zk-connect/utils";
import { Cache } from "../../caches";
import { HydraS2OffchainProver } from "../../provers/hydra-s2-offchain-prover";
import { FactoryProvider } from "../../providers/factory-provider";
import {
  DataRequestEligibility,
  ClaimRequestEligibility,
  AuthRequestEligibility,
  ZkConnectRequest,
  ZkConnectResponse,
} from "./types";

export class ZkConnectProver {
  public version = "zk-connect-v2";
  private prover: HydraS2OffchainProver;
  private factoryProvider: FactoryProvider;

  constructor({
    factoryProvider,
    cache,
  }: {
    factoryProvider: FactoryProvider;
    cache: Cache;
  }) {
    this.prover = new HydraS2OffchainProver({ cache });
    this.factoryProvider = factoryProvider;
  }

  public async verifyRequest(zkConnectRequest: ZkConnectRequest) {
    if (this.version !== zkConnectRequest.version) {
      return false;
    }
    const factoryApp = this.factoryProvider.getFactoryApp(
      zkConnectRequest.appId
    );
    if (!factoryApp) return false;
  }

  // public async get DataRequestEligibilities(
  //   zkConnectRequest: ZkConnectRequest,
  //   importedAccounts: ImportedAccount[],
  // ) : Promise<DataRequestEligibility[]> {
  //   const dataRequestEligibilities: DataRequestEligibility[] = [];

  //   return dataRequestEligibilities;
  // }

  // private async getClaimRequestEligibilities(
  //   zkConnectRequest: ZkConnectRequest,
  //   importedAccounts: ImportedAccount[]) : Promise<ClaimRequestEligibility[]> {
  //     const claimRequestEligibilities : ClaimRequestEligibility[] = [];

  //     return claimRequestEligibilities;
  //   }

  // private async getAuthRequestEligibilities(
  //   zkConnectRequest: ZkConnectRequest,
  //   importedAccounts: ImportedAccount[]) : Promise<AuthRequestEligibility[]> {
  //     const authRequestEligibilities : AuthRequestEligibility[] = [];

  //     return authRequestEligibilities;

  //   }

  // public async getStatementsEligibilities(
  //   zkConnectRequest: ZkConnectRequest,
  //   importedAccounts: ImportedAccount[]
  // ): Promise<StatementEligibility[]> {
  //   const statementRequests = zkConnectRequest?.dataRequest.statementRequests;

  //   const statementsEligibility: StatementEligibility[] = [];

  //   for (let statement of statementRequests) {
  //     const devAddresses = statement.extraData?.devAddresses;
  //     if (devAddresses) {
  //       console.warn(
  //         `Using devAddresses to check eligibility for groupId ${statement.groupId}!`,
  //         devAddresses
  //       );
  //       const lowerCaseOverrideGroupData =
  //         overrideEligibleGroupDataFormatter(devAddresses);

  //       const eligibleAccount = importedAccounts.find(
  //         (importedAccount) =>
  //           lowerCaseOverrideGroupData[importedAccount.identifier.toLowerCase()]
  //       );
  //       if (!eligibleAccount) {
  //         return null;
  //       }
  //       statementsEligibility.push({
  //         statement,
  //         accountData: {
  //           identifier: eligibleAccount.identifier,
  //           value: devAddresses[eligibleAccount.identifier] ?? 1,
  //         },
  //       });
  //       continue;
  //     }
  //     if (statement.provingScheme === "hydra-s2.1") {
  //       const accountData = await this.prover.getEligibility({
  //         accounts: importedAccounts.map((account) => account.identifier),
  //         groupId: statement.groupId,
  //         groupTimestamp: statement.groupTimestamp,
  //         comparator: statement.comparator,
  //         requestedValue: statement.requestedValue,
  //       });
  //       statementsEligibility.push({
  //         statement,
  //         accountData,
  //       });
  //     } else {
  //       console.error(
  //         `Proving scheme ${statement.provingScheme} not yet supported`
  //       );
  //       throw new Error(
  //         `Proving scheme ${statement.provingScheme} not yet supported`
  //       );
  //     }
  //   }
  //   return statementsEligibility;
  // }

  //TODO: this don't scale if we want to choose which account is used
  // public async generateResponse(
  //   zkConnectRequest: ZkConnectRequest,
  //   importedAccounts: ImportedAccount[],
  //   vaultSecret: string
  // ): Promise<ZkConnectResponse> {
  //   const appId = zkConnectRequest.appId;
  //   const namespace = zkConnectRequest.namespace;
  //   const zkConnectResponse: ZkConnectResponse = {
  //     appId,
  //     namespace,
  //     verifiableStatements: [],
  //     version: zkConnectRequest.version,
  //   };
  //   if (zkConnectRequest?.dataRequest) {
  //     zkConnectResponse.verifiableStatements = [];
  //     const statementEligibilities = await this.getStatementsEligibilities(
  //       zkConnectRequest,
  //       importedAccounts
  //     );
  //     for (let statementEligibility of statementEligibilities) {
  //       const statement = statementEligibility.statement;
  //       const devAddresses = statement.extraData?.devAddresses;
  //       const source = importedAccounts.find(
  //         (importedAccount) =>
  //           importedAccount.identifier ===
  //           statementEligibility.accountData.identifier
  //       );
  //       const snarkProof = await this.prover.generateProof({
  //         appId,
  //         source,
  //         vaultSecret,
  //         namespace,
  //         groupId: statement.groupId,
  //         groupTimestamp: statement.groupTimestamp,
  //         requestedValue: statement.requestedValue,
  //         comparator: statement.comparator,
  //         devAddresses,
  //       });
  //       zkConnectResponse.verifiableStatements.push({
  //         value: BigNumber.from(snarkProof.input[7]).toNumber(),
  //         proof: snarkProof,
  //         ...statement,
  //       });
  //     }
  //   } else {
  //     const snarkProof = await this.prover.generateProof({
  //       appId,
  //       vaultSecret,
  //     });
  //     //TODO: Weird to have to proving scheme hard coded here
  //     zkConnectResponse.authProof = {
  //       provingScheme: "hydra-s2.1",
  //       proof: snarkProof,
  //     };
  //   }
  //   return zkConnectResponse;
  // }
}
