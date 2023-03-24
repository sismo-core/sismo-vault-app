import { ImportedAccount } from "../../vault-client";
import { ClaimType } from "../zk-connect-prover/zk-connect-v2";
import { BigNumberish } from "ethers";

export type GroupTimestamp = number | "latest";

export type RequestIdentifierInputs = {
  appId: string;
  groupId: string;
  groupTimestamp: GroupTimestamp;
  namespace: string;
};

export type devAddressesType = {
  [accountIdentifier: string]: number | BigNumberish;
};

export type GetEligibilityInputs = {
  accounts: string[];
  groupId: string;
  groupTimestamp: GroupTimestamp;
  requestedValue: number;
  claimType: ClaimType;
  devAddresses?: devAddressesType;
};

export type OffchainProofRequest = {
  appId: string;
  vaultSecret: string;
  namespace?: string;
  groupId?: string;
  source?: ImportedAccount;
  groupTimestamp?: GroupTimestamp;
  requestedValue?: number;
  claimType?: ClaimType;
  devAddresses?: devAddressesType;
};

export type AccountData = {
  identifier: string;
  value: BigNumberish;
};
