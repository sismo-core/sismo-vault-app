import { BigNumberish } from "@ethersproject/bignumber";
import { AccountData } from "../../hydra-provers/types";
import { GroupMetadata } from "../../sismo-client/providers";
import { ImportedAccount } from "../../vault-client";

// import Claim from the packages

/** ********************************************* */
/** ********* ZK CONNECT PROVER TYPES ********** */
/** ********************************************* */

// export type DataRequestEligibility = {
//   claimRequestEligibility: ClaimRequestEligibility;
//   authRequestEligibility: AuthRequestEligibility;
//   messageSignatureRequest?: any;
// };

export type RequestGroupMetadata = {
  claim: ClaimRequest;
  groupMetadata: GroupMetadata;
};

export type ClaimRequestEligibility = {
  claim: ClaimRequest;
  accountData: AccountData;
  isEligible: boolean;
};

export type AuthRequestEligibility = {
  auth: AuthRequest;
  accounts: ImportedAccount[];
  isEligible: boolean;
};

/** ********************************************* */
/** ********* USER SELECT TYPES ***************** */
/** ********************************************* */

export type SelectedSismoConnectRequest = SismoConnectRequest & {
  selectedClaims?: SelectedClaimRequest[];
  selectedAuths?: SelectedAuthRequest[];
  selectedSignature?: SelectedSignatureRequest;
};

export type SelectedClaimRequestEligibility = ClaimRequestEligibility & {
  selectedClaim: SelectedClaimRequest;
};

export type SelectedAuthRequestEligibility = AuthRequestEligibility & {
  selectedAuth: SelectedAuthRequest;
};

export type SelectedClaimRequest = Omit<ClaimRequest, "value"> & {
  selectedValue?: number;
  isOptIn: boolean;
};

export type SelectedAuthRequest = Omit<AuthRequest, "userId"> & {
  selectedUserId?: string;
  isOptIn: boolean;
};

export type SelectedSignatureRequest = Omit<SignatureRequest, "message"> & {
  selectedMessage: string;
};

/** ********************************************* */
/** ********* ZK CONNECT PACKAGE TYPES ********** */
/** ********************************************* */

export const SISMO_CONNECT_VERSION = `sismo-connect-v1`;

export type SismoConnectRequest = {
  appId: string;
  namespace?: string;

  auths?: AuthRequest[];
  claims?: ClaimRequest[];
  signature?: SignatureRequest;

  devConfig?: DevConfig;
  displayRawResponse?: boolean;
  vault?: {
    impersonate: string[];
  };
  callbackPath?: string;
  callbackUrl?: string;
  version: string;
  compressed?: boolean;
};

export type AuthRequest = {
  uuid?: string;
  authType: AuthType;
  isAnon?: boolean; //false
  userId?: string;
  isOptional?: boolean;
  isSelectableByUser?: boolean;
  extraData?: any;
};

export type ClaimRequest = {
  uuid?: string;
  claimType?: ClaimType;
  groupId?: string;
  groupTimestamp?: number | "latest";
  value?: number;

  isOptional?: boolean;
  isSelectableByUser?: boolean;

  extraData?: any;
};

export type SignatureRequest = {
  message: string;
  isSelectableByUser?: boolean;
  extraData?: any;
};

export type DevConfig = {
  enabled?: boolean;
  displayRawResponse?: boolean;
  devGroups?: DevGroup[];
};

export type DevGroup = {
  groupId: string;
  groupTimestamp?: number | "latest";
  data: DevAddresses;
};

export type DevAddresses = string[] | Record<string, Number | BigNumberish>;

export enum ProvingScheme {
  HYDRA_S2 = "hydra-s2.1",
  HYDRA_S3 = "hydra-s3.1",
}

export enum ClaimType {
  GTE,
  GT,
  EQ,
  LT,
  LTE,
}

export enum AuthType {
  VAULT,
  GITHUB,
  TWITTER,
  EVM_ACCOUNT,
  TELEGRAM,
}

export type SismoConnectResponse = Pick<SismoConnectRequest, "appId" | "namespace" | "version"> & {
  signedMessage?: string;
  proofs: SismoConnectProof[];
};

export type SismoConnectProof = {
  auths?: Auth[];
  claims?: Claim[];
  provingScheme: string;
  proofData: string;
  extraData: any;
};

export type Auth = {
  uuid?: string;
  authType: AuthType;
  isAnon?: boolean; //false
  isSelectableByUser?: boolean;
  userId?: string;
  extraData?: any;
};

//TODO add omit
export type Claim = {
  uuid?: string;
  claimType?: ClaimType;
  groupId?: string;
  groupTimestamp?: number | "latest";
  isSelectableByUser?: boolean;
  value?: number;
  extraData?: any;
};

export type VerifiedClaim = Claim & {
  proofId: string;
  proofData: string;
};

export type VerifiedAuth = Auth & {
  proofData: string;
};

export class SismoConnectVerifiedResult {
  public auths: VerifiedAuth[];
  public claims: VerifiedClaim[];
  public signedMessage: string | undefined;
  public response: SismoConnectResponse;

  constructor({
    response,
    claims,
    auths,
  }: {
    response: SismoConnectResponse;
    claims: VerifiedClaim[];
    auths: VerifiedAuth[];
  }) {
    this.response = response;
    this.claims = claims;
    this.auths = auths;
    this.signedMessage = response.signedMessage;
  }

  public getUserId(authType: AuthType): string | undefined {
    const userId = this.auths.find((verifiedAuth) => verifiedAuth.authType === authType)?.userId;
    return resolveSismoIdentifier(userId, authType);
  }

  public getUserIds(authType: AuthType): string[] {
    return this.auths
      .filter((verifiedAuth) => verifiedAuth.authType === authType && verifiedAuth.userId)
      .map((auth) => resolveSismoIdentifier(auth.userId, authType)) as string[];
  }

  public getSignedMessage(): string | undefined {
    return this.signedMessage;
  }
}

const startsWithHexadecimal = (str) => {
  let hexRegex = /^0x[0-9a-fA-F]{6}/;
  return hexRegex.test(str);
};

export const resolveSismoIdentifier = (sismoIdentifier: string, authType: AuthType) => {
  if (authType === AuthType.EVM_ACCOUNT || authType === AuthType.VAULT) return sismoIdentifier;
  if (!startsWithHexadecimal(sismoIdentifier)) return sismoIdentifier;

  const removeLeadingZeros = (str) => {
    let arr = str.split("");
    while (arr.length > 1 && arr[0] === "0") {
      arr.shift();
    }
    return arr.join("");
  };
  sismoIdentifier = sismoIdentifier.substring(6);
  sismoIdentifier = removeLeadingZeros(sismoIdentifier);
  return sismoIdentifier;
};

export const toSismoIdentifier = (identifier: string, authType: AuthType) => {
  if (authType === AuthType.EVM_ACCOUNT || authType === AuthType.VAULT) return identifier;
  if (startsWithHexadecimal(identifier)) return identifier;

  let prefix = null;
  if (authType === AuthType.GITHUB) {
    prefix = "0x1001";
  }
  if (authType === AuthType.TWITTER) {
    prefix = "0x1002";
  }
  if (authType === AuthType.TELEGRAM) {
    prefix = "0x1003";
  }
  identifier = "0".repeat(36 - identifier.length) + identifier;
  identifier = prefix + identifier;
  return identifier;
};

export class RequestBuilder {
  static buildAuths(auths: AuthRequest[] | AuthRequest): AuthRequest[] {
    if (!auths) {
      return [];
    }
    if ((auths as AuthRequest)?.authType) {
      auths = [auths as AuthRequest];
    }
    auths = auths as AuthRequest[];

    for (let authRequest of auths) {
      if (authRequest.isAnon) throw new Error("isAnon not supported yet");
      if (typeof authRequest.authType === undefined) {
        throw new Error("you must provide a authType");
      }

      authRequest.isAnon = false;
      authRequest.isOptional = authRequest.isOptional ?? false;
      authRequest.isSelectableByUser = authRequest.isSelectableByUser ?? false;
      authRequest.userId = authRequest.userId ?? "0";
      authRequest.extraData = authRequest.extraData ?? "";

      if (authRequest.userId !== "0") {
        authRequest.userId = toSismoIdentifier(authRequest.userId, authRequest.authType);
      }
    }

    return auths;
  }

  static buildClaims(claims: ClaimRequest[] | ClaimRequest): ClaimRequest[] {
    if (!claims) {
      return [];
    }
    if ((claims as ClaimRequest)?.groupId) {
      claims = [claims as ClaimRequest];
    }
    claims = claims as AuthRequest[];

    for (let claimRequest of claims) {
      if (typeof claimRequest.claimType === undefined) {
        throw new Error("you must provide a claimType");
      }
      if (typeof claimRequest.groupId === undefined) {
        throw new Error("you must provide a groupId");
      }

      claimRequest.claimType = claimRequest.claimType ?? ClaimType.GTE;
      claimRequest.extraData = claimRequest.extraData ?? "";
      claimRequest.groupTimestamp = claimRequest.groupTimestamp ?? "latest";
      claimRequest.value = claimRequest.value ?? 1;
    }

    return claims;
  }

  static buildSignature(signature: SignatureRequest) {
    if (!signature) {
      return null;
    }
    if (typeof signature.message === undefined) {
      throw new Error("you must provide a message");
    }

    signature.isSelectableByUser = signature.isSelectableByUser ?? false;
    signature.extraData = signature.extraData ?? "";

    return signature;
  }
}
