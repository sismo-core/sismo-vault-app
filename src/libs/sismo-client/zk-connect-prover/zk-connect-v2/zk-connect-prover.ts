import { ethers } from "ethers";
import { ImportedAccount } from "../../../vault-client";
import { Cache } from "../../caches";
import { HydraS2OffchainProver } from "../../provers/hydra-s2-offchain-prover";
import { OffchainProofRequest } from "../../provers/types";
import { FactoryProvider } from "../../providers/factory-provider";
import {
  ClaimRequestEligibility,
  AuthRequestEligibility,
  DataRequestEligibility,
  ZkConnectRequest,
  ZkConnectResponse,
  DevConfig,
  Claim,
  AuthType,
  ClaimType,
  ZkConnectProof,
  Auth,
} from "./types";

export class ZkConnectProver {
  public version = "zk-connect-v2";
  private prover: HydraS2OffchainProver;
  private factoryProvider: FactoryProvider;

  constructor({
    factoryProvider,
    cache,
    devConfig,
  }: {
    factoryProvider: FactoryProvider;
    cache: Cache;
    devConfig?: DevConfig;
  }) {
    this.prover = new HydraS2OffchainProver({ cache, devConfig });
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

  public async getDataRequestEligibilities(
    zkConnectRequest: ZkConnectRequest,
    importedAccounts: ImportedAccount[]
  ): Promise<DataRequestEligibility[]> {
    const dataRequestEligibilities: DataRequestEligibility[] = [];

    for (const dataRequest of zkConnectRequest?.requestContent?.dataRequests) {
      const authRequestEligibility = await this.getAuthRequestEligibility(
        dataRequest?.authRequest,
        importedAccounts
      );

      const claimRequestEligibility = await this.getClaimRequestEligibility(
        dataRequest?.claimRequest,
        importedAccounts
      );

      dataRequestEligibilities.push({
        authRequestEligibility,
        claimRequestEligibility,
      });
    }

    return dataRequestEligibilities;
  }

  private async getClaimRequestEligibility(
    claimRequest: Claim,
    importedAccounts: ImportedAccount[]
  ): Promise<ClaimRequestEligibility> {
    if (!claimRequest) return null;

    const _accounts = importedAccounts?.map((account) => account.identifier);

    const accountData = await this.prover.getEligibility({
      accounts: _accounts,
      groupId: claimRequest.groupId,
      groupTimestamp: claimRequest.groupTimestamp,
      requestedValue: claimRequest.value,
      claimType: claimRequest.claimType,
    });
    return {
      claimRequest: claimRequest,
      accountData: accountData,
    };
  }

  public async getClaimRequestEligibilities(
    zkConnectRequest: ZkConnectRequest,
    importedAccounts: ImportedAccount[]
  ): Promise<ClaimRequestEligibility[]> {
    const claimRequests: Claim[] = [];

    for (const dataRequest of zkConnectRequest?.requestContent?.dataRequests) {
      if (!dataRequest?.claimRequest?.groupId) continue;
      claimRequests.push(dataRequest?.claimRequest);
    }

    if (!Boolean(claimRequests?.length)) return [];

    const claimRequestEligibilities = await Promise.all(
      claimRequests.map(async (claimRequest) => {
        return this.getClaimRequestEligibility(claimRequest, importedAccounts);
      })
    );

    console.log("ClaimRequestEligibilities", claimRequestEligibilities);
    return claimRequestEligibilities;
  }

  private async getAuthRequestEligibility(
    authRequest: Auth,
    importedAccounts: ImportedAccount[]
  ): Promise<AuthRequestEligibility> {
    if (!authRequest) return null;

    let accounts: ImportedAccount[];

    switch (authRequest?.authType) {
      case AuthType.ANON:
        accounts = importedAccounts;
        break;
      case AuthType.GITHUB:
        accounts = importedAccounts?.filter(
          (importedAccount) => importedAccount?.type === "github"
        );
        break;
      case AuthType.TWITTER:
        accounts = importedAccounts?.filter(
          (importedAccount) => importedAccount?.type === "twitter"
        );
        break;
      case AuthType.EVM_ACCOUNT:
        accounts = importedAccounts?.filter(
          (importedAccount) => importedAccount?.type === "ethereum"
        );
        break;
      default:
        break;
    }

    return {
      authRequest: authRequest,
      accounts: accounts,
    };
  }

  public async getAuthRequestEligibilities(
    zkConnectRequest: ZkConnectRequest,
    importedAccounts: ImportedAccount[]
  ): Promise<AuthRequestEligibility[]> {
    const authRequestEligibilities: AuthRequestEligibility[] = [];
    const hasAuthRequest = zkConnectRequest?.requestContent?.dataRequests?.some(
      (dataRequest) => dataRequest?.authRequest?.authType
    );

    if (!hasAuthRequest) return null;

    for (const dataRequest of zkConnectRequest?.requestContent?.dataRequests) {
      if (!dataRequest?.authRequest?.authType) continue;

      const authRequestEligibility = await this.getAuthRequestEligibility(
        dataRequest?.authRequest,
        importedAccounts
      );

      authRequestEligibilities.push(authRequestEligibility);
    }

    console.log("AuthRequestEligibilities", authRequestEligibilities);
    return authRequestEligibilities;
  }

  public async generateResponse(
    zkConnectRequest: ZkConnectRequest,
    importedAccounts: ImportedAccount[],
    vaultSecret: string
  ): Promise<ZkConnectResponse> {
    const appId = zkConnectRequest.appId;
    const namespace = zkConnectRequest.namespace;
    const zkConnectResponse: ZkConnectResponse = {
      appId,
      namespace,
      version: zkConnectRequest.version,
      proofs: [],
    };

    const dataRequests = zkConnectRequest?.requestContent?.dataRequests;

    // const dataRequestEligibilities = await this.getDataRequestEligibilities(
    //   zkConnectRequest,
    //   importedAccounts
    // )

    const claimRequestEligibilities = await this.getClaimRequestEligibilities(
      zkConnectRequest,
      importedAccounts
    );

    const authRequestEligibilities = await this.getAuthRequestEligibilities(
      zkConnectRequest,
      importedAccounts
    );

    const zkConnectResponsePromises = dataRequests?.map(async (dataRequest) => {
      let _generateProofInputs = {
        appId,
        namespace,
      } as OffchainProofRequest;

      if (dataRequest?.messageSignatureRequest) {
        let preparedSignedMessage: string;
        if (typeof dataRequest?.messageSignatureRequest === "string") {
          preparedSignedMessage = dataRequest?.messageSignatureRequest;
        } else {
          preparedSignedMessage = JSON.stringify(
            dataRequest?.messageSignatureRequest
          );
        }
        _generateProofInputs["extradata"] = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes(preparedSignedMessage)
        );
      }

      if (dataRequest?.claimRequest) {
        const claimRequestEligibility = claimRequestEligibilities.find(
          (claimRequestEligibility) =>
            claimRequestEligibility?.claimRequest?.groupId ===
            dataRequest?.claimRequest?.groupId
        );

        if (
          claimRequestEligibility?.accountData &&
          Object?.keys(claimRequestEligibility?.accountData)?.length
        ) {
          const source = importedAccounts.find(
            (importedAccount) =>
              importedAccount?.identifier ===
              claimRequestEligibility?.accountData?.identifier
          );

          _generateProofInputs = {
            ..._generateProofInputs,
            source,
            vaultSecret: "0",
            groupId: claimRequestEligibility?.claimRequest?.groupId,
            groupTimestamp:
              claimRequestEligibility?.claimRequest?.groupTimestamp,
            requestedValue: claimRequestEligibility?.claimRequest?.value,
            claimType: claimRequestEligibility?.claimRequest?.claimType,
          };
        }
      }

      if (dataRequest?.authRequest) {
        const authRequestEligibility = authRequestEligibilities?.find(
          (authRequestEligibility) =>
            authRequestEligibility?.authRequest?.authType ===
            dataRequest?.authRequest?.authType
        );

        if (dataRequest?.authRequest?.authType === AuthType.NONE) {
          _generateProofInputs = { ..._generateProofInputs };
        }

        if (dataRequest?.authRequest?.authType === AuthType.ANON) {
          // IS THESE INPUTS CORRECT IN ANON
          _generateProofInputs = {
            ..._generateProofInputs,
            vaultSecret,
          };
        }

        if (
          (dataRequest?.authRequest?.authType === AuthType.GITHUB ||
            dataRequest?.authRequest?.authType === AuthType.TWITTER ||
            dataRequest?.authRequest?.authType === AuthType.EVM_ACCOUNT) &&
          authRequestEligibility?.accounts?.length > 0
        ) {
          const destination = importedAccounts.find((importedAccount) => {
            const importedAccountType: AuthType =
              importedAccount?.type === "ethereum"
                ? AuthType.EVM_ACCOUNT
                : importedAccount?.type === "github"
                ? AuthType.GITHUB
                : importedAccount?.type === "twitter"
                ? AuthType.TWITTER
                : AuthType.NONE;

            return (
              importedAccountType ===
              authRequestEligibility?.authRequest?.authType
            );
          });

          if (destination) {
            _generateProofInputs = {
              ..._generateProofInputs,
              destination,
              vaultSecret,
            };
          }
        }
      }
      const snarkProof = await this.prover.generateProof(_generateProofInputs);
      return {
        auth: dataRequest?.authRequest
          ? dataRequest?.authRequest
          : ({
              authType: AuthType.NONE,
            } as Auth),
        claim: dataRequest?.claimRequest
          ? dataRequest?.claimRequest
          : ({
              claimType: ClaimType.NONE,
            } as Claim),
        signedMessage: dataRequest?.messageSignatureRequest,
        proof: snarkProof.toBytes(),
        extraData: dataRequest?.claimRequest
          ? dataRequest?.claimRequest?.extraData
          : dataRequest?.authRequest?.extraData,
      } as unknown as ZkConnectProof;
    });

    const zkConnectProofs = await Promise.all(zkConnectResponsePromises);

    zkConnectResponse.proofs = zkConnectProofs;

    return zkConnectResponse;
  }
}
