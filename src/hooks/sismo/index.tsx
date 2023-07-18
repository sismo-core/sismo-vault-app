import React, { useContext, useMemo } from "react";
import { SismoClient } from "../../libs/sismo-client";
import {
  RequestGroupMetadata,
  SismoConnectRequest,
} from "../../services/sismo-connect-provers/sismo-connect-prover-v1";
import { FactoryApp } from "../../libs/sismo-client";
import { GroupMetadata } from "../../libs/sismo-client/providers/group-provider";
import { SismoConnectProvers } from "../../services/sismo-connect-provers";
import { ServicesFactory } from "../../services/services-factory";

export type Sismo = SismoConnectProvers & {
  getRequestGroupMetadata: (
    sismoConnectRequest: SismoConnectRequest
  ) => Promise<RequestGroupMetadata[]>;
  getFactoryApp: (appId: string) => Promise<FactoryApp>;
  getGroupMetadata: (groupId: string, timestamp: "latest" | number) => Promise<GroupMetadata>;
};

export const useSismo = (): Sismo => {
  return useContext(SismoClientContext);
};

export const SismoClientContext = React.createContext(null);

export default function SismoProvider({
  children,
  services,
}: {
  children: React.ReactNode;
  services: ServicesFactory;
}): JSX.Element {
  const sismoConnectProvers = services.getSismoConnectProvers();
  const client = useMemo(() => new SismoClient(), []);

  const clientFunctions = useMemo(
    () => ({
      getRequestGroupMetadata: (sismoConnectRequest: SismoConnectRequest) =>
        client.getRequestGroupsMetadata(sismoConnectRequest),
      getGroupMetadata: (groupId: string, timestamp: "latest" | number) =>
        client.getGroupMetadata(groupId, timestamp),
      getFactoryApp: (appId: string) => client.getFactoryApp(appId),
    }),
    [client]
  );

  const sismoConnectProversFunctions = useMemo(
    () => ({
      initDevConfig: sismoConnectProvers.initDevConfig,
      getRegistryTreeRoot: sismoConnectProvers.getRegistryTreeRoot,
      getClaimRequestEligibilities: sismoConnectProvers.getClaimRequestEligibilities,
      getAuthRequestEligibilities: sismoConnectProvers.getAuthRequestEligibilities,
      generateResponse: sismoConnectProvers.generateResponse,
    }),
    [sismoConnectProvers]
  );

  return (
    <SismoClientContext.Provider
      value={{
        ...clientFunctions,
        ...sismoConnectProversFunctions,
      }}
    >
      {children}
    </SismoClientContext.Provider>
  );
}
