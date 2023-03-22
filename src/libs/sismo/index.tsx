import React, { useCallback, useContext } from "react";
import { SismoClient } from "../sismo-client";
import {
  StatementEligibility,
  StatementGroupMetadata,
  ZkConnectRequest,
  ZkConnectResponse,
} from "../sismo-client/zk-connect-prover/zk-connect-v1";
import { FactoryApp } from "../sismo-client";
import { GroupMetadata } from "../sismo-client/providers/group-provider";
import { ImportedAccount } from "../vault-client";

export type Sismo = {
  generateResponse: (
    zkConnectRequest: ZkConnectRequest,
    importedAccounts: ImportedAccount[],
    vaultSecret: string
  ) => Promise<ZkConnectResponse>;
  getStatementsGroupsMetadata: (
    zkConnectRequest: ZkConnectRequest
  ) => Promise<StatementGroupMetadata[]>;
  getStatementsEligibilities: (
    zkConnectRequest: ZkConnectRequest,
    importedAccounts: ImportedAccount[]
  ) => Promise<StatementEligibility[]>;
  verifyZkConnectRequest: (request: ZkConnectRequest) => Promise<any>;
  getFactoryApp: (appId: string) => Promise<FactoryApp>;
  getGroupMetadata: (
    groupId: string,
    timestamp: "latest" | number
  ) => Promise<GroupMetadata>;
};

export const useSismo = (): Sismo => {
  return useContext(SismoClientContext);
};

export const SismoClientContext = React.createContext(null);

export default function SismoProvider({
  children,
  client,
}: {
  children: React.ReactNode;
  client: SismoClient;
}): JSX.Element {
  const generateResponse = useCallback(
    (
      zkConnectRequest: ZkConnectRequest,
      importedAccounts: ImportedAccount[],
      vaultSecret: string
    ) => {
      return client.generateResponse(
        zkConnectRequest,
        importedAccounts,
        vaultSecret
      );
    },
    [client]
  );

  const getStatementsGroupsMetadata = useCallback(
    (zkConnectRequest: ZkConnectRequest) => {
      return client.getStatementsGroupsMetadata(zkConnectRequest);
    },
    [client]
  );

  const getStatementsEligibilities = useCallback(
    (
      zkConnectRequest: ZkConnectRequest,
      importedAccounts: ImportedAccount[]
    ) => {
      return client.getStatementsEligibilities(
        zkConnectRequest,
        importedAccounts
      );
    },
    [client]
  );

  const getGroupMetadata = useCallback(
    (groupId: string, timestamp: "latest" | number) => {
      return client.getGroupMetadata(groupId, timestamp);
    },
    [client]
  );

  const getFactoryApp = useCallback(
    (appId: string) => {
      return client.getFactoryApp(appId);
    },
    [client]
  );

  const verifyZkConnectRequest = useCallback(
    (request: ZkConnectRequest) => {
      return client.verifyZkConnectRequest(request);
    },
    [client]
  );

  return (
    <SismoClientContext.Provider
      value={{
        verifyZkConnectRequest,
        getGroupMetadata,
        getFactoryApp,
        getStatementsEligibilities,
        generateResponse,
        getStatementsGroupsMetadata,
      }}
    >
      {children}
    </SismoClientContext.Provider>
  );
}
