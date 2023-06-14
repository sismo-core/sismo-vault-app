import { ethers, BigNumber } from "ethers";
import { ImportedAccount } from "../../vault-client";
import {
  DataSource,
  ExternalDataSource,
  ProofRequest,
  SismoConnectAppDataSource,
} from "../../hydra-provers/types";
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
  Claim,
  RequestGroupMetadata,
} from "./types";

import { isHexlify } from "./utils/isHexlify";
import { EddsaSignature, SNARK_FIELD } from "@sismo-core/crypto";
import { getAllVaultIdentifiers } from "../../../utils/getAllVaultIdentifiers";
import { HydraProver } from "../../hydra-provers/hydra-prover";
import { CommitmentMapper } from "../../commitment-mapper";
import { keccak256 } from "ethers/lib/utils";
import { getPoseidon } from "../../poseidon";

export class SismoConnectProverV1 {
  private hydraProver: HydraProver;

  constructor({ hydraProver }: { hydraProver: HydraProver }) {
    this.hydraProver = hydraProver;
  }

  public async initDevConfig(devConfig?: DevConfig) {
    await this.hydraProver.initDevConfig(devConfig);
  }

  public async getRegistryTreeRoot(): Promise<string> {
    return await this.hydraProver.getRegistryTreeRoot();
  }

  public async getClaimRequestEligibilities(
    sismoConnectRequest: SismoConnectRequest,
    identifiers: string[]
  ): Promise<ClaimRequestEligibility[]> {
    if (!Boolean(sismoConnectRequest?.claims?.length)) return [];

    const claimRequestEligibilities = await Promise.all(
      sismoConnectRequest?.claims?.map(async (claim) => {
        return this._getClaimRequestEligibility(claim, identifiers);
      })
    );
    return claimRequestEligibilities;
  }

  private async _getClaimRequestEligibility(
    claim: ClaimRequest,
    identifiers: string[]
  ): Promise<ClaimRequestEligibility> {
    const accountData = await this.hydraProver.getEligibility({
      accounts: identifiers,
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
          importedAccount?.type === "github" &&
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

    if (auth?.authType === AuthType.TELEGRAM && auth?.isSelectableByUser) {
      accounts = importedAccounts?.filter(
        (importedAccount) => importedAccount?.type === "telegram"
      );
    }

    if (auth?.authType === AuthType.TELEGRAM && !auth?.isSelectableByUser) {
      accounts = importedAccounts?.filter(
        (importedAccount) =>
          importedAccount?.type === "telegram" &&
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
    requestGroupsMetadata: RequestGroupMetadata[],
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

    const groupsMetadata = requestGroupsMetadata?.map((el) => el.groupMetadata);
    const identifiers = await getAllVaultIdentifiers(
      groupsMetadata,
      vaultSecret,
      importedAccounts
    );

    const claimRequestEligibilities = await this.getClaimRequestEligibilities(
      selectedSismoConnectRequest,
      identifiers
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
            selectedClaim?.uuid === claimRequestEligibility?.claim?.uuid
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

      if (
        selectedClaimRequestEligibility?.isEligible &&
        selectedClaimRequestEligibility?.selectedClaim?.isOptIn
      ) {
        filteredSelectedClaimRequestEligibilities.push(
          selectedClaimRequestEligibility
        );
      }
    }

    /* ****************************************************** */
    /* *************** GENERATE CLAIM PROOFS **************** */
    /* ****************************************************** */

    let claimProofs: SismoConnectProof[] = [];

    if (filteredSelectedClaimRequestEligibilities?.length) {
      for (let selectedClaimRequestEligibility of filteredSelectedClaimRequestEligibilities) {
        // Define if the source is a ExternalAccount or a SismoCOnnectAccount
        let source: DataSource;
        const sourceIdentifier =
          selectedClaimRequestEligibility?.accountData?.identifier;

        if (sourceIdentifier.length > 42) {
          if (selectedSismoConnectRequest.version !== "sismo-connect-v1.1") {
            throw new Error(
              "Group of vaultId not available on sismo-connect-v1"
            );
          }
          // Sismo Connect Account

          // Retrieve the right appId
          const groupMetadata = requestGroupsMetadata.find(
            (el) => el.claim.uuid === selectedClaimRequestEligibility.claim.uuid
          ).groupMetadata;
          const accountTypes = groupMetadata.accountTypes;

          let namespace = null;
          const poseidon = await getPoseidon();
          for (let accountType of accountTypes) {
            const match = accountType.match(
              /sismo-connect-app\(appid=(0x[a-fA-F0-9]+)\)/i
            );
            if (match) {
              const appId = match[1];
              const _namespace = BigNumber.from(
                keccak256(
                  ethers.utils.solidityPack(
                    ["uint128", "uint128"],
                    [appId, BigNumber.from(0)]
                  )
                )
              )
                .mod(SNARK_FIELD)
                .toHexString();

              const identifier = poseidon([
                vaultSecret,
                _namespace,
              ]).toHexString();
              if (identifier === sourceIdentifier) {
                namespace = _namespace;
                break;
              }
            }
          }

          source = source as SismoConnectAppDataSource;
          source = {
            identifier: sourceIdentifier,
            secret: vaultSecret,
            namespace: namespace,
          };
        } else {
          // HydraAccount
          const importedAccount = importedAccounts?.find(
            (importedAccount) =>
              importedAccount?.identifier?.toLowerCase() ===
              sourceIdentifier?.toLowerCase()
          );
          source = source as ExternalDataSource;
          source = {
            identifier: sourceIdentifier,
            secret: CommitmentMapper.generateCommitmentMapperSecret(
              importedAccount.seed
            ),
            commitmentReceipt: [
              BigNumber.from(importedAccount.commitmentReceipt[0]),
              BigNumber.from(importedAccount.commitmentReceipt[1]),
              BigNumber.from(importedAccount.commitmentReceipt[2]),
            ] as EddsaSignature,
          };
        }

        const proof = await this._generateClaimProof(
          selectedClaimRequestEligibility,
          source,
          appId,
          namespace,
          vaultSecret,
          extraData
        );
        claimProofs.push(proof);
      }
    }

    /* ************************************************************* */
    /* **** ADD USER SELECT INPUTS TO AUTH REQUEST ELIGIBILITIES *** */
    /* ************************************************************* */

    const selectedAuthRequestEligibilities = authRequestEligibilities?.map(
      (authRequestEligibility) => {
        const selectedAuth = selectedSismoConnectRequest?.selectedAuths?.find(
          (selectedAuth) =>
            selectedAuth?.uuid === authRequestEligibility?.auth?.uuid
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

      if (
        selectedAuthRequestEligibility?.isEligible &&
        selectedAuthRequestEligibility?.selectedAuth?.isOptIn
      ) {
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
        async (selectedAuthRequestEligibility) => {
          return await this._generateAuthProof(
            selectedAuthRequestEligibility,
            importedAccounts,
            appId,
            namespace,
            vaultSecret,
            extraData
          );
        }
      );
    }

    const authProofs = await Promise.all(authPromises);
    response.proofs = [...authProofs, ...claimProofs];

    return response;
  }

  private _generateAuthProof = async (
    selectedAuthRequestEligibility: SelectedAuthRequestEligibility,
    importedAccounts: ImportedAccount[],
    appId: string,
    namespace: string,
    vaultSecret: string,
    extraData: string
  ): Promise<SismoConnectProof> => {
    let _generateProofInputs = {
      appId,
      namespace,
      vaultSecret, // VAULT SECRET MUST BE ADDED TO THE PROOF FOR THE CIRCUIT
      extraData,
    } as ProofRequest;

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

    if (selectedAuthRequestEligibility?.auth?.authType !== AuthType.VAULT) {
      const destination = importedAccounts.find((importedAccount) => {
        return (
          importedAccount.identifier?.toLowerCase() ===
          selectedAuthRequestEligibility?.selectedAuth?.selectedUserId?.toLowerCase()
        );
      });

      if (!destination)
        throw new Error("No eligible account found for this auth request");

      if (destination) {
        _generateProofInputs = {
          ..._generateProofInputs,
          destination,
        };
      }
    }

    const snarkProof = await this.hydraProver.generateProof(
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
      provingScheme: this.hydraProver.getVersion(),
    };
  };

  private _generateClaimProof = async (
    selectedClaimRequestEligibility: SelectedClaimRequestEligibility,
    source: DataSource,
    appId: string,
    namespace: string,
    vaultSecret: string,
    extraData: string
  ): Promise<SismoConnectProof> => {
    if (!source)
      throw new Error("No eligible account found for this claim request");

    const _generateProofInputs = {
      appId,
      namespace,
      vaultSecret, // VAULT SECRET MUST BE ADDED TO THE PROOF FOR THE CIRCUIT
      extraData,
      source,
      groupId: selectedClaimRequestEligibility?.claim?.groupId,
      groupTimestamp: selectedClaimRequestEligibility?.claim?.groupTimestamp,
      requestedValue:
        selectedClaimRequestEligibility?.selectedClaim?.selectedValue ??
        selectedClaimRequestEligibility?.claim?.value,
      claimType: selectedClaimRequestEligibility?.claim?.claimType,
    } as ProofRequest;

    const snarkProof = await this.hydraProver.generateProof(
      _generateProofInputs
    );

    const claimResponse = {
      claimType: selectedClaimRequestEligibility?.claim?.claimType,
      groupId: selectedClaimRequestEligibility?.claim?.groupId,
      groupTimestamp: selectedClaimRequestEligibility?.claim?.groupTimestamp,
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
      provingScheme: this.hydraProver.getVersion(),
    };
  };
}
