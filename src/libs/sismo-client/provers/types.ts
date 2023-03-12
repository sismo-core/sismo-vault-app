import { ImportedAccount } from "../../vault-client";
import { StatementComparator } from "@sismo-core/zk-connect-client";
import { BigNumberish } from "ethers";

export type RequestedValue = number | BigNumberish | "USER_SELECTED_VALUE";
export type GroupTimestamp = number | "latest";

export type RequestIdentifierInputs = {
  appId: string;
  groupId: string;
  groupTimestamp: GroupTimestamp;
  namespace: string;
};

export type GetEligibilityInputs = {
  accounts: string[];
  groupId: string;
  groupTimestamp: GroupTimestamp;
  requestedValue: RequestedValue;
  comparator: StatementComparator;
  devModeOverrideEligibleGroupData?: { [accountIdentifier: string]: number };
};

export type OffchainProofRequest = {
  appId: string;
  vaultSecret: string;
  namespace?: string;
  groupId?: string;
  source?: ImportedAccount;
  groupTimestamp?: GroupTimestamp;
  requestedValue?: RequestedValue;
  comparator?: StatementComparator;
  devModeOverrideEligibleGroupData?: { [accountIdentifier: string]: number };
};

export type AccountData = {
  identifier: string;
  value: number;
};
