import { ImportedAccount } from "../../vault-client";
import { ClaimType } from "../sismo-connect-prover-v1";
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
};

export type ProofRequest = {
  appId: string;
  vaultSecret: string;
  namespace?: string;
  groupId?: string;
  source?: ImportedAccount;
  destination?: ImportedAccount;
  groupTimestamp?: GroupTimestamp;
  requestedValue?: number;
  claimType?: ClaimType;
  extraData?: string;
};

export type AccountData = {
  identifier: string;
  value: BigNumberish;
};
