import { ethers, BigNumber } from "ethers";
import { ImportedAccount } from "../../../vault-client";
import { Cache } from "../../caches";
import { HydraS2OffchainProver } from "../../provers/hydra-s2-offchain-prover";
import { OffchainProofRequest } from "../../provers/types";
import { FactoryProvider } from "../../providers/factory-provider";
import {
  ClaimRequestEligibility,
  AuthRequestEligibility,
  SismoConnectRequest,
  SelectedSismoConnectRequest,
  SismoConnectResponse,
  DevConfig,
  ClaimRequest,
  AuthType,
  Auth,
  SismoConnectProof,
  AuthRequest,
  SelectedClaimRequestEligibility,
  SelectedAuthRequestEligibility,
  ProvingScheme,
  SISMO_CONNECT_VERSION,
  Claim,
} from "./types";

import { isHexlify } from "./utils/isHexlify";
import { SNARK_FIELD } from "@sismo-core/crypto";

export class SismoConnectProver {
  public version = SISMO_CONNECT_VERSION;
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

  public async getRegistryTreeRoot(): Promise<string> {
    return await this.prover.getRegistryTreeRoot();
  }

  private async getClaimRequestEligibility(
    claim: ClaimRequest,
    importedAccounts: ImportedAccount[]
  ): Promise<ClaimRequestEligibility> {
    const _accounts = importedAccounts?.map((account) => account.identifier);

    const accountData = await this.prover.getEligibility({
      accounts: _accounts,
      groupId: claim.groupId,
      groupTimestamp: claim.groupTimestamp,
      requestedValue: claim.value,
      claimType: claim.claimType,
    });

    const isEligible = accountData && Boolean(Object.keys(accountData)?.length);

    return {
      claim: claim,
      accountData: accountData,
      isEligible,
    };
  }

  public async getClaimRequestEligibilities(
    sismoConnectRequest: SismoConnectRequest,
    importedAccounts: ImportedAccount[]
  ): Promise<ClaimRequestEligibility[]> {
    if (!Boolean(sismoConnectRequest?.claims?.length)) return [];

    const claimRequestEligibilities = await Promise.all(
      sismoConnectRequest?.claims?.map(async (claim) => {
        return this.getClaimRequestEligibility(claim, importedAccounts);
      })
    );
    return claimRequestEligibilities;
  }

  private async getAuthRequestEligibility(
    auth: AuthRequest,
    importedAccounts: ImportedAccount[]
  ): Promise<AuthRequestEligibility> {
    let accounts: ImportedAccount[];

    if (auth?.authType === AuthType.VAULT) {
      accounts = importedAccounts;
    }

    if (auth?.authType === AuthType.GITHUB && auth?.isSelectableByUser) {
      accounts = importedAccounts?.filter(
        (importedAccount) => importedAccount?.type === "github"
      );
    }

    if (auth?.authType === AuthType.GITHUB && !auth?.isSelectableByUser) {
      accounts = importedAccounts?.filter(
        (importedAccount) =>
          importedAccount?.type === "twitter" &&
          importedAccount?.identifier?.toLowerCase() ===
            auth?.userId?.toLowerCase()
      );
    }

    if (auth?.authType === AuthType.TWITTER && auth?.isSelectableByUser) {
      accounts = importedAccounts?.filter(
        (importedAccount) => importedAccount?.type === "twitter"
      );
    }

    if (auth?.authType === AuthType.TWITTER && !auth?.isSelectableByUser) {
      accounts = importedAccounts?.filter(
        (importedAccount) =>
          importedAccount?.type === "twitter" &&
          importedAccount?.identifier?.toLowerCase() ===
            auth?.userId?.toLowerCase()
      );
    }

    if (auth?.authType === AuthType.EVM_ACCOUNT && auth?.isSelectableByUser) {
      accounts = importedAccounts?.filter(
        (importedAccount) => importedAccount?.type === "ethereum"
      );
    }

    if (auth?.authType === AuthType.EVM_ACCOUNT && !auth?.isSelectableByUser) {
      accounts = importedAccounts?.filter(
        (importedAccount) =>
          importedAccount?.type === "ethereum" &&
          importedAccount?.identifier?.toLowerCase() ===
            auth?.userId?.toLowerCase()
      );
    }

    return {
      auth: auth,
      accounts: accounts,
      isEligible:
        auth?.authType === AuthType.VAULT ? true : Boolean(accounts?.length),
    };
  }

  public async getAuthRequestEligibilities(
    sismoConnectRequest: SismoConnectRequest,
    importedAccounts: ImportedAccount[]
  ): Promise<AuthRequestEligibility[]> {
    if (!Boolean(sismoConnectRequest?.auths?.length)) return [];

    const authRequestEligibilities = await Promise.all(
      sismoConnectRequest?.auths?.map(async (auth) => {
        return this.getAuthRequestEligibility(auth, importedAccounts);
      })
    );
    return authRequestEligibilities;
  }

  public async generateResponse(
    selectedSismoConnectRequest: SelectedSismoConnectRequest,
    importedAccounts: ImportedAccount[],
    vaultSecret: string
  ): Promise<SismoConnectResponse> {
    const appId = selectedSismoConnectRequest.appId;
    const namespace = selectedSismoConnectRequest.namespace;
    const response: SismoConnectResponse = {
      appId,
      namespace,
      version: selectedSismoConnectRequest.version,
      signedMessage:
        selectedSismoConnectRequest?.selectedSignature?.selectedMessage ??
        selectedSismoConnectRequest?.signature?.message,
      proofs: [],
    };

    console.log("selectedSismoConnectRequest", selectedSismoConnectRequest);

    /* ***************************************************** */
    /* **** PREPARE EXTRADATA MESSAGE SIGNATURE REQUEST **** */
    /* ***************************************************** */

    let extraData = null;
    let message =
      selectedSismoConnectRequest?.selectedSignature?.selectedMessage ??
      selectedSismoConnectRequest?.signature?.message;

    if (message) {
      let preparedSignedMessage: string =
        typeof message === "string" ? message : JSON.stringify(message);

      if (isHexlify(preparedSignedMessage)) {
        extraData = BigNumber.from(
          ethers.utils.keccak256(ethers.utils.hexlify(preparedSignedMessage))
        )
          .mod(SNARK_FIELD)
          .toHexString();
      } else {
        extraData = BigNumber.from(
          ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(preparedSignedMessage)
          )
        )
          .mod(SNARK_FIELD)
          .toHexString();
      }
    }

    /* ******************************************************** */
    /* *** GET CLAIM REQUEST AND AUTH REQUEST ELIGIBILITIES *** */
    /* ******************************************************** */

    const claimRequestEligibilities = await this.getClaimRequestEligibilities(
      selectedSismoConnectRequest,
      importedAccounts
    );

    const authRequestEligibilities = await this.getAuthRequestEligibilities(
      selectedSismoConnectRequest,
      importedAccounts
    );

    /* ************************************************************* */
    /* **** ADD USER SELECT INPUTS TO CLAIM REQUEST ELIGIBILITIES ** */
    /* ************************************************************* */

    const selectedClaimRequestEligibilities = claimRequestEligibilities?.map(
      (claimRequestEligibility) => {
        const selectedClaim = selectedSismoConnectRequest?.selectedClaims?.find(
          (selectedClaim) =>
            selectedClaim?.groupId ===
              claimRequestEligibility?.claim?.groupId &&
            selectedClaim?.groupTimestamp ===
              claimRequestEligibility?.claim?.groupTimestamp
        );

        return {
          selectedClaim: selectedClaim,
          claim: claimRequestEligibility.claim,
          accountData: claimRequestEligibility.accountData,
          isEligible: claimRequestEligibility.isEligible,
        } as SelectedClaimRequestEligibility;
      }
    );

    /* ********************************************* */
    /* ******* FILTER ELIGIBLE CLAIM REQUESTS ****** */
    /* ********************************************* */

    const filteredSelectedClaimRequestEligibilities: SelectedClaimRequestEligibility[] =
      [];

    for (let i = 0; i < selectedClaimRequestEligibilities.length; i++) {
      const selectedClaimRequestEligibility =
        selectedClaimRequestEligibilities[i];

      if (
        (selectedClaimRequestEligibility?.claim?.isOptional === false ||
          typeof selectedClaimRequestEligibility?.claim?.isOptional ===
            undefined) &&
        !selectedClaimRequestEligibility?.isEligible
      ) {
        throw new Error("Required claim request is not eligible");
      }

      if (selectedClaimRequestEligibility?.isEligible) {
        filteredSelectedClaimRequestEligibilities.push(
          selectedClaimRequestEligibility
        );
      }
    }

    /* ****************************************************** */
    /* ************** PREPARE CLAIM PROMISES **************** */
    /* ****************************************************** */

    let claimPromises: Promise<SismoConnectProof>[] = [];

    if (filteredSelectedClaimRequestEligibilities?.length) {
      claimPromises = filteredSelectedClaimRequestEligibilities?.map(
        async (selectedClaimRequestEligibility): Promise<SismoConnectProof> => {
          const source = importedAccounts.find(
            (importedAccount) =>
              importedAccount?.identifier?.toLowerCase() ===
              selectedClaimRequestEligibility?.accountData?.identifier?.toLowerCase()
          );

          if (!source)
            throw new Error("No eligible account found for this claim request");

          const _generateProofInputs = {
            appId,
            namespace,
            vaultSecret, // VAULT SECRET MUST BE ADDED TO THE PROOF FOR THE CIRCUIT
            extraData,
            source,
            groupId: selectedClaimRequestEligibility?.claim?.groupId,
            groupTimestamp:
              selectedClaimRequestEligibility?.claim?.groupTimestamp,
            requestedValue:
              selectedClaimRequestEligibility?.selectedClaim?.selectedValue ??
              selectedClaimRequestEligibility?.claim?.value,
            claimType: selectedClaimRequestEligibility?.claim?.claimType,
          } as OffchainProofRequest;

          const snarkProof = await this.prover.generateProof(
            _generateProofInputs
          );

          const claimResponse = {
            claimType: selectedClaimRequestEligibility?.claim?.claimType,
            groupId: selectedClaimRequestEligibility?.claim?.groupId,
            groupTimestamp:
              selectedClaimRequestEligibility?.claim?.groupTimestamp,
            value:
              selectedClaimRequestEligibility?.selectedClaim?.selectedValue ??
              selectedClaimRequestEligibility?.claim?.value,
            extraData: selectedClaimRequestEligibility?.claim?.extraData,
            isSelectableByUser:
              selectedClaimRequestEligibility?.claim?.isSelectableByUser,
          } as Claim;

          return {
            claims: [claimResponse],
            proofData: snarkProof.toBytes(),
            extraData: "",
            provingScheme: ProvingScheme.HYDRA_S2,
          };
        }
      );
    }

    /* ************************************************************* */
    /* **** ADD USER SELECT INPUTS TO CLAIM REQUEST ELIGIBILITIES ** */
    /* ************************************************************* */

    const selectedAuthRequestEligibilities = authRequestEligibilities?.map(
      (authRequestEligibility) => {
        const selectedAuth = selectedSismoConnectRequest?.selectedAuths?.find(
          (selectedAuth) =>
            selectedAuth?.authType === authRequestEligibility?.auth?.authType &&
            selectedAuth?.userId === authRequestEligibility?.auth?.userId
        );

        return {
          selectedAuth: selectedAuth,
          auth: authRequestEligibility.auth,
          accounts: authRequestEligibility.accounts,
          isEligible: authRequestEligibility.isEligible,
        } as SelectedAuthRequestEligibility;
      }
    );

    /* ********************************************* */
    /* ******* FILTER REQUIRED AUTH REQUESTS ******* */
    /* ********************************************* */

    const filteredSelectedAuthRequestEligibilities: SelectedAuthRequestEligibility[] =
      [];

    for (let i = 0; i < selectedAuthRequestEligibilities.length; i++) {
      const selectedAuthRequestEligibility =
        selectedAuthRequestEligibilities[i];

      if (
        (selectedAuthRequestEligibility?.auth?.isOptional === false ||
          typeof selectedAuthRequestEligibility?.auth?.isOptional ===
            undefined) &&
        !selectedAuthRequestEligibility?.isEligible
      ) {
        throw new Error("Required auth request is not eligible");
      }

      if (selectedAuthRequestEligibility?.isEligible) {
        filteredSelectedAuthRequestEligibilities.push(
          selectedAuthRequestEligibility
        );
      }
    }

    /* ****************************************************** */
    /* ************** PREPARE AUTH PROMISES ***************** */
    /* ****************************************************** */

    let authPromises: Promise<SismoConnectProof>[] = [];

    if (filteredSelectedAuthRequestEligibilities?.length) {
      authPromises = filteredSelectedAuthRequestEligibilities?.map(
        async (selectedAuthRequestEligibility): Promise<SismoConnectProof> => {
          let _generateProofInputs = {
            appId,
            namespace,
            vaultSecret, // VAULT SECRET MUST BE ADDED TO THE PROOF FOR THE CIRCUIT
            extraData,
          } as OffchainProofRequest;

          if (
            selectedAuthRequestEligibility?.auth?.authType !== AuthType.VAULT &&
            !selectedAuthRequestEligibility?.selectedAuth?.selectedUserId
          ) {
            throw new Error("No account selected for this auth request");
          }

          if (
            selectedAuthRequestEligibility?.auth?.authType !== AuthType.VAULT &&
            !selectedAuthRequestEligibility?.isEligible
          ) {
            throw new Error("No account found for this auth request");
          }

          if (
            selectedAuthRequestEligibility?.auth?.authType !== AuthType.VAULT
          ) {
            const destination = importedAccounts.find((importedAccount) => {
              return (
                importedAccount.identifier?.toLowerCase() ===
                selectedAuthRequestEligibility?.selectedAuth?.selectedUserId?.toLowerCase()
              );
            });

            if (!destination)
              throw new Error(
                "No eligible account found for this auth request"
              );

            if (destination) {
              _generateProofInputs = {
                ..._generateProofInputs,
                destination,
              };
            }
          }

          const snarkProof = await this.prover.generateProof(
            _generateProofInputs
          );

          const authResponse = {
            authType: selectedAuthRequestEligibility?.auth?.authType,
            userId:
              selectedAuthRequestEligibility?.auth?.authType === AuthType.VAULT
                ? ethers.utils.hexlify(BigNumber.from(snarkProof.input[10])) // VAULT USER ID
                : selectedAuthRequestEligibility?.selectedAuth?.selectedUserId,
            extraData: selectedAuthRequestEligibility?.auth?.extraData,
            isSelectableByUser:
              selectedAuthRequestEligibility?.auth?.isSelectableByUser,
          } as Auth;

          return {
            auths: [authResponse],
            proofData: snarkProof.toBytes(),
            extraData: "",
            provingScheme: ProvingScheme.HYDRA_S2,
          };
        }
      );
    }

    const promises = [...claimPromises, ...authPromises];

    const sismoConnectProofs = await Promise.all(promises);
    response.proofs = sismoConnectProofs;

    return response;
  }
}
