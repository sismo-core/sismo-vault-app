import React, { useCallback, useContext } from "react";
import { SismoClient } from "../sismo-client";
import {
  AuthRequestEligibility,
  ClaimRequestEligibility,
  RequestGroupMetadata,
  SismoConnectRequest,
  SismoConnectResponse,
} from "../sismo-client/sismo-connect-prover/sismo-connect-v1";
import { FactoryApp } from "../sismo-client";
import { GroupMetadata } from "../sismo-client/providers/group-provider";
import { ImportedAccount } from "../vault-client";

export type Sismo = {
  initDevConfig: (sismoConnectRequest: SismoConnectRequest) => void;
  generateResponse: (
    sismoConnectRequest: SismoConnectRequest,
    importedAccounts: ImportedAccount[],
    vaultSecret: string
  ) => Promise<SismoConnectResponse>;
  getRequestGroupMetadata: (
    sismoConnectRequest: SismoConnectRequest
  ) => Promise<RequestGroupMetadata[]>;
  getClaimRequestEligibilities: (
    sismoConnectRequest: SismoConnectRequest,
    importedAccounts: ImportedAccount[]
  ) => Promise<ClaimRequestEligibility[]>;
  getAuthRequestEligibilities: (
    sismoConnectRequest: SismoConnectRequest,
    importedAccounts: ImportedAccount[]
  ) => Promise<AuthRequestEligibility[]>;
  // verifySismoConnectRequest: (request: SismoConnectRequest) => Promise<any>;
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
  const initDevConfig = useCallback(
    (sismoConnectRequest: SismoConnectRequest) => {
      return client.initDevConfig(sismoConnectRequest);
    },
    [client]
  );

  const generateResponse = useCallback(
    (
      sismoConnectRequest: SismoConnectRequest,
      importedAccounts: ImportedAccount[],
      vaultSecret: string
    ) => {
      return client.generateResponse(
        sismoConnectRequest,
        importedAccounts,
        vaultSecret
      );
    },
    [client]
  );

  const getRequestGroupMetadata = useCallback(
    (sismoConnectRequest: SismoConnectRequest) => {
      return client.getRequestGroupsMetadata(sismoConnectRequest);
    },
    [client]
  );

  const getClaimRequestEligibilities = useCallback(
    (
      sismoConnectRequest: SismoConnectRequest,
      importedAccounts: ImportedAccount[]
    ) => {
      return client.getClaimRequestEligibilities(
        sismoConnectRequest,
        importedAccounts
      );
    },
    [client]
  );
  const getAuthRequestEligibilities = useCallback(
    (
      sismoConnectRequest: SismoConnectRequest,
      importedAccounts: ImportedAccount[]
    ) => {
      return client.getAuthRequestEligibilities(
        sismoConnectRequest,
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

  return (
    <SismoClientContext.Provider
      value={{
        initDevConfig,
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
