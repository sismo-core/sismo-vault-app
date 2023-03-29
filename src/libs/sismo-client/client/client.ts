import {
  ClaimRequestEligibility,
  AuthRequestEligibility,
  DataRequestEligibility,
  RequestGroupMetadata,
  ZkConnectProver as ZkConnectProverV2,
  ZkConnectRequest,
  ZkConnectResponse,
  DevConfig,
} from "../zk-connect-prover/zk-connect-v2";
import { Cache } from "../caches";
import { FactoryApp, FactoryProvider } from "../providers/factory-provider";
import env from "../../../environment";
import { GroupProvider } from "../providers/group-provider";
import { ImportedAccount } from "../../vault-client";

export class SismoClient {
  private factoryProvider: FactoryProvider;
  private groupProvider: GroupProvider;
  private zkConnectProvers: {
    "zk-connect-v2": ZkConnectProverV2;
  };

  constructor({ cache, devConfig }: { cache: Cache; devConfig?: DevConfig }) {
    this.factoryProvider = new FactoryProvider({
      factoryApiUrl: env.factoryApiUrl,
    });
    this.groupProvider = new GroupProvider({ hubApiUrl: env.hubApiUrl });
    this.zkConnectProvers = {
      "zk-connect-v2": new ZkConnectProverV2({
        factoryProvider: this.factoryProvider,
        cache: cache,
        devConfig,
      }),
    };
  }

  public async getGroupMetadata(groupId: string, timestamp: "latest" | number) {
    return await this.groupProvider.getGroupMetadata(groupId, timestamp);
  }

  public async getFactoryApp(appId: string): Promise<FactoryApp> {
    return await this.factoryProvider.getFactoryApp(appId);
  }

  public async getRequestGroupsMetadata(
    zkConnectRequest: ZkConnectRequest
  ): Promise<RequestGroupMetadata[]> {
    const hasClaimRequest =
      zkConnectRequest?.requestContent?.dataRequests?.some(
        (dataRequest) => dataRequest?.claimRequest?.groupId
      );

    if (!hasClaimRequest) return null;
    const requestGroupsMetadata: RequestGroupMetadata[] = [];

    for (const dataRequest of zkConnectRequest.requestContent.dataRequests) {
      const claimRequest = dataRequest?.claimRequest;
      if (!claimRequest) continue;
      const groupMetadata = await this.getGroupMetadata(
        claimRequest.groupId,
        claimRequest.groupTimestamp
      );
      requestGroupsMetadata.push({
        groupMetadata,
        claim: claimRequest,
      });
    }
  }

  public async getDataRequestEligibilities(
    zkConnectRequest: ZkConnectRequest,
    importedAccounts: ImportedAccount[]
  ): Promise<DataRequestEligibility[]> {
    if (!this.zkConnectProvers[zkConnectRequest.version])
      throw new Error(
        `Version of the request not supported ${zkConnectRequest.version}`
      );
    const zkConnectProver = this.zkConnectProvers[
      zkConnectRequest.version
    ] as ZkConnectProverV2;

    return await zkConnectProver.getDataRequestEligibilities(
      zkConnectRequest,
      importedAccounts
    );
  }

  public async getClaimRequestEligibilities(
    zkConnectRequest: ZkConnectRequest,
    importedAccounts: ImportedAccount[]
  ): Promise<ClaimRequestEligibility[]> {
    if (!this.zkConnectProvers[zkConnectRequest.version])
      throw new Error(
        `Version of the request not supported ${zkConnectRequest.version}`
      );
    const zkConnectProver = this.zkConnectProvers[
      zkConnectRequest.version
    ] as ZkConnectProverV2;

    return await zkConnectProver.getClaimRequestEligibilities(
      zkConnectRequest,
      importedAccounts
    );
  }

  public async getAuthRequestEligibilities(
    zkConnectRequest: ZkConnectRequest,
    importedAccounts: ImportedAccount[]
  ): Promise<AuthRequestEligibility[]> {
    if (!this.zkConnectProvers[zkConnectRequest.version])
      throw new Error(
        `Version of the request not supported ${zkConnectRequest.version}`
      );
    const zkConnectProver = this.zkConnectProvers[
      zkConnectRequest.version
    ] as ZkConnectProverV2;

    return await zkConnectProver.getAuthRequestEligibilities(
      zkConnectRequest,
      importedAccounts
    );
  }

  public async generateResponse(
    zkConnectRequest: ZkConnectRequest,
    importedAccounts: ImportedAccount[],
    vaultSecret: string
  ): Promise<ZkConnectResponse> {
    if (!this.zkConnectProvers[zkConnectRequest.version])
      throw new Error(
        `Version of the request not supported ${zkConnectRequest.version}`
      );
    const zkConnectProver = this.zkConnectProvers[zkConnectRequest.version];
    return zkConnectProver.generateResponse(
      zkConnectRequest,
      importedAccounts,
      vaultSecret
    );
  }
}
