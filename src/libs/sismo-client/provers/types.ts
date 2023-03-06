import { ImportedAccount } from "../../vault-client";

export type OffchainProofRequest = {
  appId: string;
  serviceName: string;
  acceptHigherValues: boolean;
  value: number | "MAX";
  source: ImportedAccount;
  groupId: string;
  groupTimestamp: number | "latest";
};

export type AccountData = {
  identifier: string;
  value: number;
};
