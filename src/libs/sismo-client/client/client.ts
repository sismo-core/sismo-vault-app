import {
  ClaimRequestEligibility,
  AuthRequestEligibility,
  RequestGroupMetadata,
  SismoConnectProver as SismoConnectProverV1,
  SismoConnectRequest,
  SismoConnectResponse,
  SelectedSismoConnectRequest,
} from "../sismo-connect-prover/sismo-connect-v1";
import { Cache } from "../../cache-service";
import { FactoryApp, FactoryProvider } from "../providers/factory-provider";
import env from "../../../environment";
import { GroupProvider } from "../providers/group-provider";
import { ImportedAccount } from "../../vault-client-v2";

export class SismoClient {
  private factoryProvider: FactoryProvider;
  private groupProvider: GroupProvider;
  private sismoConnectProvers: {
    "sismo-connect-v1": SismoConnectProverV1;
  };

  constructor({ cache }: { cache: Cache }) {
    this.factoryProvider = new FactoryProvider({
      factoryApiUrl: env.factoryApiUrl,
    });
    this.groupProvider = new GroupProvider({ hubApiUrl: env.hubApiUrl });
    this.sismoConnectProvers = {
      "sismo-connect-v1": new SismoConnectProverV1({
        factoryProvider: this.factoryProvider,
        cache: cache,
      }),
    };

    // Add commitment mapper service
  }

  public async initDevConfig(sismoConnectRequest: SismoConnectRequest) {
    if (!this.sismoConnectProvers[sismoConnectRequest.version])
      throw new Error(
        `Version of the request not supported ${sismoConnectRequest.version}`
      );
    const sismoConnectProver = this.sismoConnectProvers[
      sismoConnectRequest.version
    ] as SismoConnectProverV1;

    if (sismoConnectRequest?.devConfig?.enabled !== false)
      await sismoConnectProver.initDevConfig(sismoConnectRequest?.devConfig);
  }

  public async getRegistryTreeRoot(
    sismoConnectRequest: SismoConnectRequest
  ): Promise<string> {
    if (!this.sismoConnectProvers[sismoConnectRequest.version])
      throw new Error(
        `Version of the request not supported ${sismoConnectRequest.version}`
      );
    const sismoConnectProver = this.sismoConnectProvers[
      sismoConnectRequest.version
    ] as SismoConnectProverV1;

    return await sismoConnectProver.getRegistryTreeRoot();
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

  public async getClaimRequestEligibilities(
    sismoConnectRequest: SismoConnectRequest,
    importedAccounts: ImportedAccount[]
  ): Promise<ClaimRequestEligibility[]> {
    if (!this.sismoConnectProvers[sismoConnectRequest.version])
      throw new Error(
        `Version of the request not supported ${sismoConnectRequest.version}`
      );
    const sismoConnectProver = this.sismoConnectProvers[
      sismoConnectRequest.version
    ] as SismoConnectProverV1;

    return await sismoConnectProver.getClaimRequestEligibilities(
      sismoConnectRequest,
      importedAccounts
    );
  }

  public async getAuthRequestEligibilities(
    sismoConnectRequest: SismoConnectRequest,
    importedAccounts: ImportedAccount[]
  ): Promise<AuthRequestEligibility[]> {
    if (!this.sismoConnectProvers[sismoConnectRequest.version])
      throw new Error(
        `Version of the request not supported ${sismoConnectRequest.version}`
      );
    const sismoConnectProver = this.sismoConnectProvers[
      sismoConnectRequest.version
    ] as SismoConnectProverV1;

    return await sismoConnectProver.getAuthRequestEligibilities(
      sismoConnectRequest,
      importedAccounts
    );
  }

  public async generateResponse(
    sismoConnectRequest: SelectedSismoConnectRequest,
    importedAccounts: ImportedAccount[],
    vaultSecret: string
  ): Promise<SismoConnectResponse> {
    if (!this.sismoConnectProvers[sismoConnectRequest.version])
      throw new Error(
        `Version of the request not supported ${sismoConnectRequest.version}`
      );
    const sismoConnectProver =
      this.sismoConnectProvers[sismoConnectRequest.version];
    return sismoConnectProver.generateResponse(
      sismoConnectRequest,
      importedAccounts,
      vaultSecret
    );
  }
}
