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
  getRequestGroupMetadata: (
    zkConnectRequest: ZkConnectRequest
  ) => Promise<StatementGroupMetadata[]>;
  getClaimRequestEligibilities: (
    zkConnectRequest: ZkConnectRequest,
    importedAccounts: ImportedAccount[]
  ) => Promise<StatementEligibility[]>;
  getAuthRequestEligibilities: (
    zkConnectRequest: ZkConnectRequest,
    importedAccounts: ImportedAccount[]
  ) => Promise<StatementEligibility[]>;
  // verifyZkConnectRequest: (request: ZkConnectRequest) => Promise<any>;
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

  const getRequestGroupMetadata = useCallback(
    (zkConnectRequest: ZkConnectRequest) => {
      return client.getRequestGroupsMetadata(zkConnectRequest);
    },
    [client]
  );

  const getClaimRequestEligibilities = useCallback(
    (
      zkConnectRequest: ZkConnectRequest,
      importedAccounts: ImportedAccount[]
    ) => {
      return client.getClaimRequestEligibilities(
        zkConnectRequest,
        importedAccounts
      );
    },
    [client]
  );
  const getAuthRequestEligibilities = useCallback(
    (
      zkConnectRequest: ZkConnectRequest,
      importedAccounts: ImportedAccount[]
    ) => {
      return client.getAuthRequestEligibilities(
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

  // const verifyZkConnectRequest = useCallback(
  //   (request: ZkConnectRequest) => {
  //     return client.verifyZkConnectRequest(request);
  //   },
  //   [client]
  // );

  return (
    <SismoClientContext.Provider
      value={{
        // verifyZkConnectRequest,
        getGroupMetadata,
        getFactoryApp,
        getRequestGroupMetadata,
        getClaimRequestEligibilities,
        generateResponse,
        getAuthRequestEligibilities,
      }}
    >
      {children}
    </SismoClientContext.Provider>
  );
}
