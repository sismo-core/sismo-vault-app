import React, { useCallback, useContext } from "react";
import {
  EligibleBadge,
  Badge,
  SismoClient,
  MintedBadge,
  Account,
  SortParameters,
  Metrics,
} from "../sismo-client";
import { Proof, ProofRequest } from "../sismo-client/attesters/types";
import { ImportedAccount } from "../vault-client";
import { Attestation } from "../sismo-client/attestation-registry/types";
import { OffchainProofRequest } from "../sismo-client/provers/types";
import { SnarkProof } from "@sismo-core/hydra-s1";

export type Sismo = {
  getBadges: (sortParameters?: SortParameters) => Promise<Badge[]>;
  getBadge: (collectionId: number, chainId: number) => Promise<Badge>;
  getMintedBadges: (
    accounts: Account[],
    collectionIds: number[],
    chainIds: number[]
  ) => Promise<MintedBadge[]>;
  getPublicEligibleBadges: (
    accounts: Account[],
    collectionIds: number[],
    chainIds: number[]
  ) => Promise<EligibleBadge[]>;
  getEligibleBadges: (
    accounts: ImportedAccount[],
    collectionIds: number[],
    chainIds: number[]
  ) => Promise<EligibleBadge[]>;
  getNullifier: (
    collectionId: number,
    chainId: number,
    account: ImportedAccount
  ) => Promise<string>;
  onBadgeMinted: (
    chainId: number,
    listener: (mintedBadge: MintedBadge) => void
  ) => void;
  generateProofs: (requests: ProofRequest[]) => Promise<Proof[]>;
  generateZkProofs: (requests: ProofRequest[]) => Promise<Proof>;
  generateAttestations: (proofs: Proof[]) => Promise<Attestation>;
  getMetrics: (chainIds: number[]) => Promise<Metrics>;
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
  const getEligibleBadges = useCallback(
    (
      accounts: ImportedAccount[],
      collectionIds: number[],
      chainIds: number[]
    ) => {
      return client.getEligibleBadges(accounts, collectionIds, chainIds);
    },
    [client]
  );

  const getBadge = useCallback(
    (collectionId: number, chainId: number) => {
      return client.getBadge(collectionId, chainId);
    },
    [client]
  );

  const getBadges = useCallback(
    (sortParameters?: SortParameters) => {
      return client.getBadges(sortParameters);
    },
    [client]
  );

  const getMintedBadges = useCallback(
    (
      accounts: ImportedAccount[],
      collectionIds: number[],
      chainIds: number[]
    ) => {
      return client.getMintedBadges(accounts, collectionIds, chainIds);
    },
    [client]
  );

  const generateProofs = useCallback(
    (requests: ProofRequest[]) => {
      return client.generateProofs(requests);
    },
    [client]
  );

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

  const generateAttestations = useCallback(
    (proofs: Proof[]) => {
      return client.generateAttestations(proofs);
    },
    [client]
  );

  const getPublicEligibleBadges = useCallback(
    (accounts: Account[], collectionIds: number[], chainIds: number[]) => {
      return client.getPublicEligibleBadges(accounts, collectionIds, chainIds);
    },
    [client]
  );

  const getMetrics = useCallback(
    (chainIds) => {
      return client.getMetrics(chainIds);
    },
    [client]
  );

  const getNullifier = useCallback(
    (collectionId: number, chainId: number, account: ImportedAccount) => {
      return client.getNullifier(collectionId, chainId, account);
    },
    [client]
  );

  const onBadgeMinted = useCallback(
    (chainId: number, listener: (mintedBadge: MintedBadge) => void) => {
      return client.onBadgeMinted(chainId, listener);
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
        getEligibleBadges,
        getBadges,
        getBadge,
        getMintedBadges,
        onBadgeMinted,
        generateProofs,
        generateOffchainProof,
        generateAttestations,
        getPublicEligibleBadges,
        getMetrics,
        getNullifier,
        getEligibility,
      }}
    >
      {children}
    </SismoClientContext.Provider>
  );
}
