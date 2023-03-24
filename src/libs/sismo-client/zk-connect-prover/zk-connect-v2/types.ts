import { BigNumberish } from "@ethersproject/bignumber";
import { AccountData } from "../../provers/types";
import { GroupMetadata } from "../../providers";
import { ImportedAccount } from "../../../vault-client";

// import Claim from the packages

/** ********************************************* */
/** ********* ZK CONNECT PROVER TYPES ********** */
/** ********************************************* */

export type RequestGroupMetadata = {
  claim: Claim;
  groupMetadata: GroupMetadata;
};

export type DataRequestEligibility = {
  requestClaimEligibilities: ClaimRequestEligibility[];
  requestAuthEligibilities: AuthRequestEligibility[];
};

export type ClaimRequestEligibility = {
  claimRequest: Claim;
  accountData: AccountData;
};

export type AuthRequestEligibility = {
  authRequest: Auth;
  accounts: ImportedAccount[];
};

/** ********************************************* */
/** ********* ZK CONNECT PACKAGE TYPES ********** */
/** ********************************************* */

export type ZkConnectRequest = {
  appId: string;
  namespace?: string;
  requestContent?: ZkConnectRequestContent; // updated
  callbackPath?: string;
  version: string;
};

export type DevAddresses = string[] | Record<string, Number | BigNumberish>;

export type DevConfig = {
  enabled?: boolean; // https://dev.vault-beta.sismo.io/
  modalOutput: "bytes" | "typescript" | null; // if bytes, open a modal with the ZkConnectResponse direclty encoded in bytes + registryTreeRoot displayed
  // Allow to customize data for each groupId
  devGroups?: DevGroup[];
};

export type DevGroup = {
  groupId: string;
  groupTimestamp: number | "latest";
  data: DevAddresses;
};

export type ZkConnectRequestContent = {
  dataRequests: DataRequest[];
  // should be dataRequests.length - 1 and all the same for now
  operators: LogicalOperator[];
};
export type LogicalOperator = "AND" | "OR";

export type DataRequest = {
  authRequest?: Auth;
  claimRequest?: Claim;
  messageSignatureRequest?: any;
};

// I request higher than 3 ("3", "GTE");
// I request any value from my user ("ANY", "EQUAL");
export type Claim = {
  groupId: string;
  groupTimestamp: number | "latest"; // default to "latest"
  value: number; // default to 1
  claimType: ClaimType; // default to GTE
  extraData: any; // default to ''
};

export enum ClaimType {
  NONE,
  GTE,
  GT,
  EQ,
  LT,
  LTE,
  USER_SELECT,
}

export type Auth = {
  // twitter// github// evmAccount
  authType: AuthType;
  // if anonMode == true, user does not reveal the Id
  // they only prove ownership of one account of this type in the vault
  anonMode: boolean; // anonMode default false;
  // githubAccount / twitter account / ethereum address
  // if userId == 0, user can chose any userId
  userId: string; // default 0
  extraData: any; // default ''
};

export enum AuthType {
  NONE,
  ANON,
  GITHUB,
  TWITTER,
  EVM_ACCOUNT,
}

// DataRequest = [
// Auth: {
//   authType: AuthType.ANON,
// }
// ];

export type ZkConnectResponse = Pick<
  ZkConnectRequest,
  "appId" | "namespace" | "version"
> & {
  proofs: ZkConnectProof[];
};

export type ZkConnectProof = {
  auth: Auth;
  claim: Claim;
  provingScheme?: string;
  signedMessage: string | any;
  proofData: string;
  proofId?: string;
  extraData: any;
};

//Return by the zkConnect.verify
export type ZkConnectVerifiedResult = ZkConnectResponse & {
  signedMessage: string[];
  verifiedClaims: VerifiedClaim[];
  verifiedAuths: VerifiedAuth[];
};

export type VerifiedClaim = Claim & {
  proofId: string;
  __proof: string;
};

export type VerifiedAuth = Auth & {
  proofId: string;
  __proof: string;
};
