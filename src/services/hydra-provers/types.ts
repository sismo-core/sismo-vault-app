import { ImportedAccount } from "../vault-client";
import { ClaimType } from "../sismo-connect-provers/sismo-connect-prover-v1";
import { BigNumberish } from "ethers";
import { EddsaSignature } from "@sismo-core/crypto";

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

export type SismoConnectAppDataSource = {
  identifier: string;
  secret: string;
  namespace: string;
};

export type ExternalDataSource = {
  identifier: string;
  secret: string;
  commitmentReceipt: EddsaSignature;
};

export type DataSource = SismoConnectAppDataSource | ExternalDataSource;

export type ProofRequest = {
  appId: string;
  vaultSecret: string;
  namespace?: string;
  groupId?: string;
  source?: DataSource;
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
