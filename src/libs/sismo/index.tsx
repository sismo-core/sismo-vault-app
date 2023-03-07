import React, { useCallback, useContext } from "react";
import { SismoClient } from "../sismo-client";
import { OffchainProofRequest } from "../sismo-client/provers/types";
import { SnarkProof } from "@sismo-core/hydra-s1";

export type Sismo = {
  getEligibility: ({
    accounts,
    groupId,
    timestamp,
    acceptHigherValues,
    value,
  }: {
    accounts: string[];
    groupId: string;
    timestamp: number | "latest";
    acceptHigherValues: boolean;
    value: number | "MAX";
  }) => Promise<{ [key: string]: number }>;
  generateOffchainProof: ({
    appId,
    serviceName,
    acceptHigherValues,
    value,
    source,
    groupId,
    groupTimestamp,
  }: OffchainProofRequest) => Promise<SnarkProof>;
};

export const useSismo = (): SismoClient => {
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
  const generateOffchainProof = useCallback(
    ({
      appId,
      serviceName,
      acceptHigherValues,
      value,
      source,
      groupId,
      groupTimestamp,
    }: OffchainProofRequest) => {
      return client.generateOffchainProof({
        appId,
        serviceName,
        acceptHigherValues,
        value,
        source,
        groupId,
        groupTimestamp,
      });
    },
    [client]
  );

  const getEligibility = useCallback(
    ({
      accounts,
      groupId,
      timestamp,
      acceptHigherValues,
      value,
    }: {
      accounts: string[];
      groupId: string;
      timestamp: number | "latest";
      acceptHigherValues: boolean;
      value: number | "MAX";
    }) => {
      return client.getEligibility({
        accounts,
        groupId,
        timestamp,
        acceptHigherValues,
        value,
      });
    },
    [client]
  );

  return (
    <SismoClientContext.Provider
      value={{
        generateOffchainProof,
        getEligibility,
      }}
    >
      {children}
    </SismoClientContext.Provider>
  );
}
