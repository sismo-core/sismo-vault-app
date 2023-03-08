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
};

export type AccountData = {
  identifier: string;
  value: number;
};

export type StatementRequest = {
  groupId: string;
  groupTimestamp: GroupTimestamp; // default to "latest"
  requestedValue: RequestedValue; // If "MAX" the max value inside the group should be selected. The user can select what he wants to reveal
  comparator?: StatementComparator; // default to "GTE". , "EQ" . If requestedValue="MAX" comparator should be empty
  provingScheme?: any;
};

export type DataRequest = {
  statementRequests?: StatementRequest[];
  operator?: LogicalOperator;
};

export type ZkConnectRequest = {
  version: string;
  appId: string;
  namespace: string;
  dataRequest?: DataRequest; // we can initiate a zkConnect without dataRequest
  callbackPath?: string;
};
