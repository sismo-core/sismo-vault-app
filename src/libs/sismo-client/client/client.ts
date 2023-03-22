import {
  StatementEligibility,
  StatementGroupMetadata,
  ZkConnectProver as ZkConnectProverV1,
  ZkConnectRequest,
  ZkConnectResponse,
} from "../zk-connect-prover/zk-connect-v1";
import { Cache } from "../caches";
import { FactoryApp, FactoryProvider } from "../providers/factory-provider";
import env from "../../../environment";
import { GroupProvider } from "../providers/group-provider";
import { ImportedAccount } from "../../vault-client";

export class SismoClient {
  private factoryProvider: FactoryProvider;
  private groupProvider: GroupProvider;
  private zkConnectProvers: {
    "zk-connect-v1": ZkConnectProverV1;
  };

  constructor({ cache }: { cache: Cache }) {
    this.factoryProvider = new FactoryProvider({
      factoryApiUrl: env.factoryApiUrl,
    });
    this.groupProvider = new GroupProvider({ hubApiUrl: env.hubApiUrl });
    this.zkConnectProvers = {
      "zk-connect-v1": new ZkConnectProverV1({
        factoryProvider: this.factoryProvider,
        cache: cache,
      }),
    };
  }

  public async getGroupMetadata(groupId: string, timestamp: "latest" | number) {
    return await this.groupProvider.getGroupMetadata(groupId, timestamp);
  }

  public async getFactoryApp(appId: string): Promise<FactoryApp> {
    return await this.factoryProvider.getFactoryApp(appId);
  }

  public async getStatementsGroupsMetadata(
    zkConnectRequest: ZkConnectRequest
  ): Promise<StatementGroupMetadata[]> {
    if (!zkConnectRequest.dataRequest) return null;
    const statementGroupMetadata: StatementGroupMetadata[] = [];
    for (let statement of zkConnectRequest.dataRequest.statementRequests) {
      const groupMetadata = await this.groupProvider.getGroupMetadata(
        statement.groupId,
        statement.groupTimestamp
      );
      statementGroupMetadata.push({
        groupMetadata,
        statement,
      });
    }
    return statementGroupMetadata;
  }

  public async getStatementsEligibilities(
    zkConnectRequest: ZkConnectRequest,
    importedAccounts: ImportedAccount[]
  ): Promise<StatementEligibility[]> {
    if (!this.zkConnectProvers[zkConnectRequest.version])
      throw new Error(
        `Version of the request not supported ${zkConnectRequest.version}`
      );
    const zkConnectProver = this.zkConnectProvers[zkConnectRequest.version];
    return await zkConnectProver.getStatementsEligibilities(
      zkConnectRequest,
      importedAccounts
    );
  }

  //TODO source + vaultSecret
  // + Weird to have a source here
  public generateResponse(
    zkConnectRequest: ZkConnectRequest,
    source: ImportedAccount,
    vaultSecret: string
  ): Promise<ZkConnectResponse> {
    if (!this.zkConnectProvers[zkConnectRequest.version])
      throw new Error(
        `Version of the request not supported ${zkConnectRequest.version}`
      );
    const zkConnectProver = this.zkConnectProvers[zkConnectRequest.version];
    return zkConnectProver.generateResponse(
      zkConnectRequest,
      source,
      vaultSecret
    );
  }

  //TODO
  public verifyZkConnectRequest(zkConnectRequest: ZkConnectRequest) {
    if (!this.zkConnectProvers[zkConnectRequest.version])
      throw new Error(
        `Version of the request not supported ${zkConnectRequest.version}`
      );
    const zkConnectProver = this.zkConnectProvers[zkConnectRequest.version];
    return zkConnectProver.verifyRequest(zkConnectRequest);
  }
}
