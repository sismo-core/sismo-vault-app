import {
  RequestGroupMetadata,
  SismoConnectRequest,
} from "../../../services/sismo-connect-provers/sismo-connect-prover-v1";
import { FactoryApp, FactoryProvider } from "../providers/factory-provider";
import env from "../../../environment";
import { GroupProvider } from "../providers/group-provider";

export class SismoClient {
  private factoryProvider: FactoryProvider;
  private groupProvider: GroupProvider;

  constructor() {
    this.factoryProvider = new FactoryProvider({
      factoryApiUrl: env.factoryApiUrl,
    });
    this.groupProvider = new GroupProvider({ hubApiUrl: env.hubApiUrl });
  }

  public async getGroupMetadata(groupId: string, timestamp: "latest" | number) {
    return await this.groupProvider.getGroupMetadata(groupId, timestamp);
  }

  public async getFactoryApp(appId: string): Promise<FactoryApp> {
    return await this.factoryProvider.getFactoryApp(appId);
  }

  public async getRequestGroupsMetadata(
    sismoConnectRequest: SismoConnectRequest
  ): Promise<RequestGroupMetadata[]> {
    const hasClaimRequest = sismoConnectRequest?.claims?.length > 0;

    if (!hasClaimRequest) return null;
    const requestGroupsMetadata: RequestGroupMetadata[] = [];

    for (const claimRequest of sismoConnectRequest.claims) {
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
}
