export type ZkConnectRequest = {
  dataRequest: DataRequest;
  appId: string;
  namespace?: string;
  callbackPath?: string;
  version: string;
};

export enum ProvingScheme {
  HYDRA_S1 = "hydra-s1.1",
}

export type DataRequest = {
  statementRequests: StatementRequest[];
  operator: LogicalOperator;
};

export type StatementRequest = {
  groupId: string;
  groupTimestamp?: number | "latest"; // default to "latest"
  requestedValue?: number | "USER_SELECTED_VALUE"; // If "MAX" the max value inside the group should be selected. The user can select what he wants to reveal
  comparator?: StatementComparator; // default to "GTE". , "EQ" If requestedValue="USER_SELECTED_VALUE" comparator "GTE"
  provingScheme?: any;
  extraData?: StatementRequestExtraData;
};

export type StatementRequestExtraData = {
  devModeOverrideEligibleGroupData?: { [accountIdentifier: string]: number };
};

export type StatementComparator = "GTE" | "EQ";

export type VerifiableStatement = StatementRequest & {
  value: number;
  proof: any;
};
export type VerifiedStatement = VerifiableStatement & { proofId: string };

export type LogicalOperator = "AND" | "OR";

export type ZkConnectResponse = Omit<
  ZkConnectRequest,
  "callbackPath" | "dataRequest"
> & {
  authProof?: {
    provingScheme: any;
    proof: any;
  };
  verifiableStatements: VerifiableStatement[];
};
