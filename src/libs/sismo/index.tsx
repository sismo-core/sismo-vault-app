import React, { useCallback, useContext } from "react";
import { SismoClient } from "../sismo-client";
import {
  OffchainProofRequest,
  GetEligibilityInputs,
} from "../sismo-client/provers/types";
import { SnarkProof } from "@sismo-core/hydra-s1";

export type Sismo = {
  getEligibility: ({
    accounts,
    groupId,
    groupTimestamp,
    comparator,
    requestedValue,
  }: GetEligibilityInputs) => Promise<{ [key: string]: number }>;
  generateOffchainProof: ({
    appId,
    namespace,
    comparator,
    requestedValue,
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
      source,
      vaultSecret,
      namespace,
      groupId,
      groupTimestamp,
      requestedValue,
      comparator,
      devAddresses,
    }: OffchainProofRequest) => {
      return client.generateOffchainProof({
        appId,
        source,
        vaultSecret,
        namespace,
        groupId,
        groupTimestamp,
        requestedValue,
        comparator,
        devAddresses,
      });
    },
    [client]
  );

  const getEligibility = useCallback(
    ({
      accounts,
      groupId,
      groupTimestamp,
      comparator,
      requestedValue,
      devAddresses,
    }: GetEligibilityInputs) => {
      return client.getEligibility({
        accounts,
        groupId,
        groupTimestamp,
        comparator,
        requestedValue,
        devAddresses,
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
