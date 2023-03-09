import { ImportedAccount } from "../../vault-client";

export type LogicalOperator = "AND" | "OR";
export type StatementComparator = "GTE" | "EQ";
export type RequestedValue = number | "USER_SELECTED_VALUE";
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
