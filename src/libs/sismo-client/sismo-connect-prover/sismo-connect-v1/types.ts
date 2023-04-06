import { BigNumberish } from "@ethersproject/bignumber";
import { AccountData } from "../../provers/types";
import { GroupMetadata } from "../../providers";
import { ImportedAccount } from "../../../vault-client";

// import Claim from the packages

/** ********************************************* */
/** ********* ZK CONNECT PROVER TYPES ********** */
/** ********************************************* */

export type DataRequestEligibility = {
  claimRequestEligibility: ClaimRequestEligibility;
  authRequestEligibility: AuthRequestEligibility;
  messageSignatureRequest?: any;
};

export type RequestGroupMetadata = {
  claim: ClaimRequest;
  groupMetadata: GroupMetadata;
};

export type GroupMetadataClaimRequestEligibility = ClaimRequestEligibility & {
  groupMetadata: GroupMetadata;
};

export type ClaimRequestEligibility = {
  claimRequest: ClaimRequest;
  accountData: AccountData;
  isEligible: boolean;
};

export type AuthRequestEligibility = {
  authRequest: AuthRequest;
  accounts: ImportedAccount[];
  isEligible: boolean;
};

/** ********************************************* */
/** ********* USER SELECT TYPES ***************** */
/** ********************************************* */

export type SelectedSismoConnectRequest = SismoConnectRequest & {
  selectedClaimRequests?: SelectedClaimRequest[];
  selectedAuthRequests?: SelectedAuthRequest[];
  selectedSignatureRequest?: SelectedSignatureRequest;
};

export type SelectedClaimRequestEligibility = ClaimRequestEligibility & {
  selectedClaimRequest: SelectedClaimRequest;
};

export type SelectedAuthRequestEligibility = AuthRequestEligibility & {
  selectedAuthRequest: SelectedAuthRequest;
};

export type SelectedClaimRequest = ClaimRequest & {
  selectedValue: number;
};

export type SelectedAuthRequest = AuthRequest & {
  selectedUserId: string;
};

export type SelectedSignatureRequest = SignatureRequest & {
  selectedMessage: string;
};

/** ********************************************* */
/** ********* ZK CONNECT PACKAGE TYPES ********** */
/** ********************************************* */

export const SISMO_CONNECT_VERSION = `sismo-connect-v1`;

export type SismoConnectRequest = {
  appId: string;
  namespace?: string;

  authRequests?: AuthRequest[];
  claimRequests?: ClaimRequest[];
  signatureRequest?: SignatureRequest;

  devConfig?: DevConfig;
  callbackPath?: string;
  version: string;
};

export type AuthRequest = {
  authType: AuthType;
  isAnon?: boolean; //false
  userId?: string;
  isOptional?: boolean;
  isSelectableByUser?: boolean;
  extraData?: any;
};

export type ClaimRequest = {
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
}

export type SismoConnectResponse = Pick<
  SismoConnectRequest,
  "appId" | "namespace" | "version"
> & {
  signedMessage?: string;
  proofs: SismoConnectProof[];
};

export type SismoConnectProof = {
  auths?: AuthRequest[];
  claims?: ClaimRequest[];
  provingScheme: string;
  proofData: string;
  extraData: any;
};

export type VerifiedClaim = ClaimRequest & {
  proofId: string;
  proofData: string;
};

export type VerifiedAuth = AuthRequest & {
  proofData: string;
};
