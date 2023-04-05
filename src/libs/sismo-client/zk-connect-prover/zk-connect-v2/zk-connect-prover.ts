import { BigNumber, ethers } from "ethers";
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
import { AccountData } from "../../provers/types";
import { SNARK_FIELD } from "@sismo-core/hydra-s2";
import { isHexlify } from "./utils/isHexlify";

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

  public async initDevConfig(devConfig?: DevConfig) {
    await this.prover.initDevConfig(devConfig);
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
        messageSignatureRequest: dataRequest?.messageSignatureRequest,
      });
    }

    return dataRequestEligibilities;
  }

  private async getClaimRequestEligibility(
    claimRequest: Claim,
    importedAccounts: ImportedAccount[]
  ): Promise<ClaimRequestEligibility> {
    if (!claimRequest || claimRequest?.claimType === ClaimType.EMPTY)
      return {
        claimRequest: {
          claimType: ClaimType.EMPTY,
        } as Claim,
        accountData: {} as AccountData,
      };

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
    return claimRequestEligibilities;
  }

  private async getAuthRequestEligibility(
    authRequest: Auth,
    importedAccounts: ImportedAccount[]
  ): Promise<AuthRequestEligibility> {
    let accounts: ImportedAccount[];

    // TO BE REVIEWED IF NULL
    if (!authRequest || authRequest?.authType === AuthType.EMPTY)
      return {
        authRequest: {
          authType: AuthType.EMPTY,
        } as Auth,
        accounts: accounts,
      };

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
    return authRequestEligibilities;
  }

  public async generateResponse(
    zkConnectRequest: ZkConnectRequest,
    importedAccounts: ImportedAccount[],
    vaultSecret: string
  ): Promise<ZkConnectResponse> {
    // TODO ADD ERROR HANDLING IF NO ELIGIBILITY

    const appId = zkConnectRequest.appId;
    const namespace = zkConnectRequest.namespace;
    const zkConnectResponse: ZkConnectResponse = {
      appId,
      namespace,
      version: zkConnectRequest.version,
      proofs: [],
    };

    let dataRequestEligibilities = await this.getDataRequestEligibilities(
      zkConnectRequest,
      importedAccounts
    );

    /* ********************************************* */
    /* ******* FILTER ELIGIBLE DATA REQUESTS ******* */
    /* ********************************************* */

    let selectedDataRequestEligibilities = [];

    if (zkConnectRequest?.requestContent?.operators[0] === "AND") {
      selectedDataRequestEligibilities = dataRequestEligibilities;
    }

    if (zkConnectRequest?.requestContent?.operators[0] === "OR") {
      for (const dataRequestEligibility of dataRequestEligibilities) {
        const hasClaimRequest =
          dataRequestEligibility?.claimRequestEligibility?.claimRequest
            ?.claimType !== ClaimType.EMPTY;
        const hasAuthRequest =
          dataRequestEligibility?.authRequestEligibility?.authRequest
            ?.authType !== AuthType.EMPTY;

        const isClaimEligible =
          dataRequestEligibility?.claimRequestEligibility?.accountData &&
          Object.keys(
            dataRequestEligibility?.claimRequestEligibility?.accountData
          ).length > 0;

        const isAuthEligible =
          dataRequestEligibility?.authRequestEligibility?.accounts?.length > 0;

        if (
          hasClaimRequest &&
          hasAuthRequest &&
          isClaimEligible &&
          isAuthEligible &&
          selectedDataRequestEligibilities?.length === 0
        ) {
          selectedDataRequestEligibilities.push(dataRequestEligibility);
        } else if (
          hasClaimRequest &&
          isClaimEligible &&
          selectedDataRequestEligibilities?.length === 0
        ) {
          selectedDataRequestEligibilities.push(dataRequestEligibility);
        } else if (
          hasAuthRequest &&
          isAuthEligible &&
          selectedDataRequestEligibilities?.length === 0
        ) {
          selectedDataRequestEligibilities.push(dataRequestEligibility);
        }
      }
    }

    if (selectedDataRequestEligibilities?.length === 0)
      throw new Error("No eligible data requests");

    const zkConnectResponsePromises = selectedDataRequestEligibilities?.map(
      async (dataRequestEligibility) => {
        let _generateProofInputs = {
          appId: "0",
          namespace,
          vaultSecret, // VAULT SECRET MUST BE ADDED TO THE PROOF FOR THE CIRCUIT
        } as OffchainProofRequest;

        /* ********************************************* */
        /* ********* MESSAGE SIGNATURE REQUEST ********* */
        /* ********************************************* */

        if (dataRequestEligibility?.messageSignatureRequest) {
          let preparedSignedMessage: string;
          if (
            typeof dataRequestEligibility?.messageSignatureRequest === "string"
          ) {
            preparedSignedMessage =
              dataRequestEligibility?.messageSignatureRequest;
          } else {
            preparedSignedMessage = JSON.stringify(
              dataRequestEligibility?.messageSignatureRequest
            );
          }
          if (isHexlify(preparedSignedMessage)) {
            _generateProofInputs["extraData"] = BigNumber.from(ethers.utils.keccak256(
              ethers.utils.hexlify(preparedSignedMessage)
            ))
            .mod(SNARK_FIELD)
            .toHexString();
          } else {
            _generateProofInputs["extraData"] = BigNumber.from(ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes(preparedSignedMessage)
            ))
            .mod(SNARK_FIELD)
            .toHexString();;
          }
        }

        /* ********************************************* */
        /* ************** CLAIM REQUEST **************** */
        /* ********************************************* */

        if (
          dataRequestEligibility?.claimRequestEligibility?.claimRequest
            ?.claimType !== ClaimType.EMPTY
        ) {
          const claimRequestEligibility =
            dataRequestEligibility?.claimRequestEligibility;

          if (
            !claimRequestEligibility?.accountData ||
            !Object?.keys(claimRequestEligibility?.accountData)?.length
          )
            throw new Error("No account found for this claim request");

          const source = importedAccounts.find(
            (importedAccount) =>
              importedAccount?.identifier?.toLowerCase() ===
              dataRequestEligibility?.claimRequestEligibility?.accountData?.identifier?.toLowerCase()
          );

          if (!source)
            throw new Error("No eligible account found for this claim request");

          _generateProofInputs = {
            ..._generateProofInputs,
            source,
            appId,
            groupId: claimRequestEligibility?.claimRequest?.groupId,
            groupTimestamp:
              claimRequestEligibility?.claimRequest?.groupTimestamp,
            requestedValue: claimRequestEligibility?.claimRequest?.value,
            claimType: claimRequestEligibility?.claimRequest?.claimType,
          };
        }

        /* ********************************************* */
        /* ************** AUTH REQUEST ***************** */
        /* ********************************************* */

        if (
          dataRequestEligibility?.authRequestEligibility?.authRequest
            ?.authType !== AuthType.EMPTY
        ) {
          const authRequestEligibility =
            dataRequestEligibility?.authRequestEligibility;

          if (authRequestEligibility?.authRequest?.authType === AuthType.ANON) {
            // IS THESE INPUTS CORRECT IN ANON
            _generateProofInputs = {
              ..._generateProofInputs,
              vaultSecret,
              appId,
            };
          }

          if (
            (authRequestEligibility?.authRequest?.authType ===
              AuthType.GITHUB ||
              authRequestEligibility?.authRequest?.authType ===
                AuthType.TWITTER ||
              authRequestEligibility?.authRequest?.authType ===
                AuthType.EVM_ACCOUNT) &&
            !Boolean(authRequestEligibility?.accounts?.length)
          )
            throw new Error("No account found for this auth request");

          if (
            (authRequestEligibility?.authRequest?.authType ===
              AuthType.GITHUB ||
              authRequestEligibility?.authRequest?.authType ===
                AuthType.TWITTER ||
              authRequestEligibility?.authRequest?.authType ===
                AuthType.EVM_ACCOUNT) &&
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
                  : AuthType.EMPTY;

              return (
                importedAccountType ===
                authRequestEligibility?.authRequest?.authType
              );
            });

            if (!destination)
              throw new Error("No eligible account found for auth request");

            if (destination) {
              _generateProofInputs = {
                ..._generateProofInputs,
                destination,
                vaultSecret,
              };
            }
          }
        }
        const snarkProof = await this.prover.generateProof(
          _generateProofInputs
        );
        return {
          auth: dataRequestEligibility?.authRequestEligibility?.authRequest,
          claim: dataRequestEligibility?.claimRequestEligibility?.claimRequest,
          signedMessage: dataRequestEligibility?.messageSignatureRequest,
          proofData: snarkProof.toBytes(),
          extraData: "",
          provingScheme: "hydra-s2.1",
        } as ZkConnectProof;
      }
    );

    const zkConnectProofs = await Promise.all(zkConnectResponsePromises);

    zkConnectResponse.proofs = zkConnectProofs;

    return zkConnectResponse;
  }
}
