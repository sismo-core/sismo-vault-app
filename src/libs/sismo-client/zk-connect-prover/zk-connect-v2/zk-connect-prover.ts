import { ethers } from "ethers";
import { ImportedAccount } from "../../../vault-client";
import { Cache } from "../../caches";
import { HydraS2OffchainProver } from "../../provers/hydra-s2-offchain-prover";
import { OffchainProofRequest } from "../../provers/types";
import { FactoryProvider } from "../../providers/factory-provider";
import {
  ClaimRequestEligibility,
  AuthRequestEligibility,
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

  public async getClaimRequestEligibilities(
    zkConnectRequest: ZkConnectRequest,
    importedAccounts: ImportedAccount[]
  ): Promise<ClaimRequestEligibility[]> {
    const claimRequestEligibilities: ClaimRequestEligibility[] = [];
    const claimRequests: Claim[] = [];

    const hasClaimRequest =
      zkConnectRequest?.requestContent?.dataRequests?.some(
        (dataRequest) => dataRequest?.claimRequest?.groupId
      );

    if (!hasClaimRequest) return null;

    for (const dataRequest of zkConnectRequest?.requestContent?.dataRequests) {
      if (!dataRequest?.claimRequest?.groupId) continue;
      claimRequests.push(dataRequest.claimRequest);
    }

    const _accounts = importedAccounts?.map((account) => account.identifier);

    const accountDatas = await Promise.all(
      claimRequests.map(async (claimRequest) => {
        return await this.prover.getEligibility({
          accounts: _accounts,
          groupId: claimRequest.groupId,
          groupTimestamp: claimRequest.groupTimestamp,
          requestedValue: claimRequest.value,
          claimType: claimRequest.claimType,
        });
      })
    );

    for (const accountData of accountDatas) {
      const _claimRequestEligibility: ClaimRequestEligibility = {
        claimRequest: claimRequests[accountDatas.indexOf(accountData)],
        accountData: accountData,
      };

      claimRequestEligibilities.push(_claimRequestEligibility);
    }

    console.log("claimRequestEligibilities", claimRequestEligibilities);
    return claimRequestEligibilities;
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

      let accounts = [];

      switch (dataRequest?.authRequest?.authType) {
        case AuthType.ANON | AuthType.NONE:
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

      authRequestEligibilities.push({
        authRequest: dataRequest?.authRequest,
        accounts: accounts?.map((account) => account.identifier),
      });
    }

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
          !claimRequestEligibility?.accountData ||
          !Object?.keys(claimRequestEligibility?.accountData)?.length
        )
          return;

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
          groupTimestamp: claimRequestEligibility?.claimRequest?.groupTimestamp,
          requestedValue: claimRequestEligibility?.claimRequest?.value,
          claimType: claimRequestEligibility?.claimRequest?.claimType,
        };
      }

      // if (dataRequest?.authRequest) {
      //   const authRequestEligibility = authRequestEligibilities?.find(
      //     (authRequestEligibility) =>
      //       authRequestEligibility?.authRequest?.authType ===
      //       dataRequest?.authRequest?.authType
      //   );

      // if (
      //   !authRequestEligibility?.accountData ||
      //   !Object?.keys(authRequestEligibility?.accountData)?.length
      // )
      //   return;

      //   const destination = importedAccounts.find((importedAccount) => {
      //     const importedAccountType: AuthType =
      //       importedAccount?.type === "ethereum"
      //         ? AuthType.EVM_ACCOUNT
      //         : importedAccount?.type === "github"
      //         ? AuthType.GITHUB
      //         : importedAccount?.type === "twitter"
      //         ? AuthType.TWITTER
      //         : AuthType.NONE;

      //     return (
      //       importedAccountType ===
      //       authRequestEligibility?.authRequest?.authType
      //     );
      //   });

      //   _generateProofInputs = {
      //     ..._generateProofInputs,
      //     destination,
      //     vaultSecret,
      //   };
      // }
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
