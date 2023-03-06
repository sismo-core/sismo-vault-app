import {
  Badge,
  EligibleBadge,
  MintedBadge,
  Account,
  SortParameters,
} from "../types";
import {
  ChainIdToName,
  ContractABIs,
  SupportedChainId,
} from "../contracts/commons/constants";
import env from "../../../environment";
import { fetchBadges } from "../services/badges";
import { Attesters } from "../attesters";
import { HydraS1Accountbound } from "../attesters/hydraS1/HydraS1Accountbound";
import { Proof, ProofRequest } from "../attesters/types";
import { HydraS1Simple } from "../attesters/hydraS1/HydraS1Simple";
import { Relayer } from "../relayer";
import { FrontendLibContract } from "../contracts/frontend-lib";
import { ImportedAccount } from "../../vault-client";
import { getWeb3Provider } from "../../web3-providers";
import {
  AttestationRegistryClient,
  OnChainAttestationRegistry,
} from "../attestation-registry";
import { Cache } from "../caches";
import { getNullifier } from "../utils/getNullifier";
import { Badges } from "../badges/badges";
import { fetchBadge } from "../services/badge";
import { getTotalBadgeMinted, getTotalUniqueUsers } from "../services/stats";
import { HydraS1OffchainProver } from "../provers/hydra-s1-offchain-prover";

export type RelayerByChain = {
  [chainId: number]: Relayer;
};

export type Metrics = {
  totalUniqueUsers: number;
  totalBadgeMinted: number;
  totalBadgeCreated: number;
};

export class SismoClient {
  public attesters: Attesters;
  private badges: { [chainId: number]: Badges } = {};
  private attestationRegistries: {
    [chainId: number]: AttestationRegistryClient;
  } = {};

  //TODO Refactor this
  public relayers: RelayerByChain = {};
  public chainId: SupportedChainId;
  public prover: HydraS1OffchainProver;

  constructor({ cache, chainIds }: { cache: Cache; chainIds: number[] }) {
    for (const chainId of chainIds) {
      const provider = getWeb3Provider(chainId);

      this.relayers[chainId] = new Relayer({
        endpoints: env.relayerEndpoints[chainId],
      });

      this.attestationRegistries[chainId] = new OnChainAttestationRegistry({
        chainId,
        provider,
        logsLimit: env.rpc[chainId].logsLimit,
        contractAddress: env.contracts[chainId]["AttestationsRegistry"].address,
        contractABI: ContractABIs["AttestationsRegistry"],
      });

      this.badges[chainId] = new Badges({
        provider,
        chainId,
      });
    }

    this.prover = new HydraS1OffchainProver({ cache });

    const hydraS1Simple = new HydraS1Simple({
      relayers: this.relayers,
      cache,
    });
    const hydraS1AccountBound = new HydraS1Accountbound({
      relayers: this.relayers,
      cache,
    });

    this.attesters = new Attesters([hydraS1Simple, hydraS1AccountBound]);
  }

  /*****************************************************************/
  /*************************** METADATA ****************************/
  /*****************************************************************/

  public async getBadge(collectionId: number, chainId: number): Promise<Badge> {
    return await fetchBadge(this.attesters, collectionId, chainId);
  }

  public async getBadges(sortParameters?: SortParameters): Promise<Badge[]> {
    const { filters } = sortParameters || {};
    let _chainIds = [];
    if (filters?.chainIds) {
      _chainIds = filters.chainIds;
    } else {
      _chainIds = env.chainIds;
    }
    let allBadges;
    allBadges = await fetchBadges(this.attesters, {
      ...sortParameters,
      filters: {
        ...filters,
        chainIds: _chainIds,
      },
    });
    return allBadges;
  }

  /*****************************************************************/
  /*************************** METRICS ****************************/
  /*****************************************************************/

  public async getMetrics(chainIds: number[]): Promise<Metrics> {
    let metrics: Metrics = {
      totalUniqueUsers: 0,
      totalBadgeMinted: 0,
      totalBadgeCreated: 0,
    };
    const allBadges = await fetchBadges(this.attesters, {
      filters: { chainIds },
    });
    metrics.totalBadgeCreated = allBadges.length;
    metrics.totalBadgeMinted = await getTotalBadgeMinted(chainIds);
    metrics.totalUniqueUsers = await getTotalUniqueUsers(chainIds);
    return metrics;
  }

  /*****************************************************************/
  /************************ ELIGIBILITY ****************************/
  /*****************************************************************/
  public async getEligibility({
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
  }) {
    const accountData = await this.prover.getEligibility({
      accounts,
      groupId,
      timestamp,
      acceptHigherValues,
      value,
    });
    return accountData;
  }

  public async getPublicEligibleBadges(
    accounts: Account[],
    collectionIds: number[],
    chainIds: number[]
  ): Promise<EligibleBadge[]> {
    if (!accounts) return [];
    let eligibleBadges: EligibleBadge[] = [];
    const badges = await this.getBadges();
    for (let chainId of chainIds) {
      const eligibleAttestations = await this.attesters.getEligibleAttestations(
        accounts,
        collectionIds,
        chainId
      );
      const eligibleBadgesByChain = eligibleAttestations.map(
        (eligibleAttestation) => ({
          badge: badges.find(
            (badge) => badge.collectionId === eligibleAttestation.collectionId
          ),
          value: eligibleAttestation.value,
          source: accounts.find(
            (account) => account.identifier === eligibleAttestation.owner
          ),
          networks: [ChainIdToName[chainIds[0]]],
        })
      );
      eligibleBadges = eligibleBadges.concat(eligibleBadgesByChain);
    }
    return eligibleBadges;
  }

  //TODO Add multi chain gestion
  public async getEligibleBadges(
    accounts: ImportedAccount[],
    collectionIds: number[],
    chainIds: number[]
  ): Promise<EligibleBadge[]> {
    let publicEligibleBadges = await this.getPublicEligibleBadges(
      accounts,
      collectionIds,
      chainIds
    );
    let eligibleBadges: EligibleBadge[] = [];
    for (const _chainId of chainIds) {
      /*********** GET NULLIFIERS OF ELIGIBLE BADGES ********/
      const nullifiers: string[] = [];
      for (const publicEligibleBadge of publicEligibleBadges) {
        const attester = this.attesters.getAttester(
          publicEligibleBadge.badge.collectionId
        );
        const internalCollectionId = attester.getInternalCollectionId(
          publicEligibleBadge.badge.collectionId
        );
        const seed = accounts.find(
          (account) =>
            account.identifier === publicEligibleBadge.source.identifier
        )?.seed;
        const contractAddress = attester.getAddress(_chainId);
        const nullifier = await getNullifier(
          internalCollectionId,
          contractAddress,
          seed
        );
        nullifiers.push(nullifier.toString());
      }

      /*********** TEST IN LOCAL WITH GET BALANCE OF ********** */
      if (env.name === "LOCAL") {
        const frontendLib = new FrontendLibContract({
          signerOrProvider: getWeb3Provider(_chainId),
          chainId: _chainId,
        });
        const destinationsOfNullifiers =
          await frontendLib.getHydraS1AccountboundAttesterDestinationOfNullifierBatch(
            nullifiers
          );

        for (const [
          index,
          publicEligibleBadge,
        ] of publicEligibleBadges.entries()) {
          if (
            destinationsOfNullifiers[index] ===
            "0x0000000000000000000000000000000000000000"
          ) {
            eligibleBadges.push(publicEligibleBadge);
          }
        }
      } else {
        if (nullifiers.length > 0) {
          const attestations = await this.attestationRegistries[
            _chainId
          ].getAttestations({ nullifiers });
          for (let [index, nullifier] of nullifiers.entries()) {
            if (
              !attestations.find(
                (attestation) => attestation.extraData.nullifier === nullifier
              )
            ) {
              eligibleBadges.push(publicEligibleBadges[index]);
            }
          }
        }
      }
    }
    return eligibleBadges;
  }

  /*****************************************************************/
  /**************************** MINTED *****************************/
  /*****************************************************************/

  public onBadgeMinted(
    chainId: number,
    listener: (mintedBadge: MintedBadge) => void
  ) {
    this.attestationRegistries[chainId].onAttestationRecorded(
      async (attestation) => {
        if (attestation) {
          const badge = await this.getBadges({
            filters: {
              collectionIds: [attestation.collectionId],
            },
          });
          listener({
            badge: badge[0],
            owner: { identifier: attestation.owner },
            network: ChainIdToName[chainId],
            value: attestation.value,
          });
        }
      }
    );
  }

  public async getMintedBadges(
    accounts: Account[],
    collectionIds: number[],
    chainIds: number[]
  ): Promise<MintedBadge[]> {
    if (!accounts) return [];

    const badges = await this.getBadges();
    const badgesToTest = badges.filter((badge) =>
      collectionIds.includes(badge.collectionId)
    );

    let mintedBadges: MintedBadge[] = [];
    if (env.name === "LOCAL") {
      const userBadgesArrays = await Promise.all(
        chainIds.map((chainId) =>
          this.badges[chainId].getMintedBadgesFromContracts(
            accounts,
            badgesToTest
          )
        )
      );
      for (let [index, userBadges] of userBadgesArrays.entries()) {
        const chainId = chainIds[index];
        for (let userBadge of userBadges) {
          mintedBadges.push({
            badge: badgesToTest.find(
              (badge) => badge.collectionId === userBadge.badge.collectionId
            ),
            network: ChainIdToName[chainId],
            owner: accounts.find(
              (account) => account.identifier === userBadge.owner.identifier
            ),
            value: userBadge.value.toString(),
          });
        }
      }
    } else {
      for (let chainId of chainIds) {
        const owners = accounts.map((account) => account.identifier);
        const ownedAttestations = await this.attestationRegistries[
          chainId
        ].getAttestations({
          owners,
          collectionIds,
        });
        mintedBadges = mintedBadges.concat(
          ownedAttestations.map((ownedAttestation) => ({
            badge: badgesToTest.find(
              (badge) => badge.collectionId === ownedAttestation.collectionId
            ),
            network: ChainIdToName[chainId],
            owner: accounts.find(
              (account) => account.identifier === ownedAttestation.owner
            ),
            value: ownedAttestation.value,
          }))
        );
      }
    }
    return mintedBadges;
  }

  /*****************************************************************/
  /**************************** EVENTS *****************************/
  /*****************************************************************/

  public async generateProofs(requests: ProofRequest[]): Promise<Proof[]> {
    return await this.attesters.generateProofs(requests);
  }

  public async generateOffchainProof({
    appId,
    serviceName,
    acceptHigherValues,
    value,
    source,
    groupId,
    groupTimestamp,
  }: {
    appId: string;
    serviceName: string;
    acceptHigherValues: boolean;
    value: number | "MAX";
    source: ImportedAccount;
    groupId: string;
    groupTimestamp: number | "latest";
  }) {
    return await this.prover.generateProof({
      appId,
      serviceName,
      acceptHigherValues,
      value,
      source,
      groupId,
      groupTimestamp,
    });
  }

  public async generateAttestations(proofs: Proof[]): Promise<void> {
    for (let proof of proofs) {
      this.attestationRegistries[proof.request.chainId].addInListeningQueue(
        proof.request.collectionId,
        proof.request.destination.identifier
      );
    }
    try {
      await this.attesters.generateAttestations(proofs);
    } catch (e) {
      for (let proof of proofs) {
        this.attestationRegistries[
          proof.request.chainId
        ].removeFromListeningQueue(
          proof.request.collectionId,
          proof.request.destination.identifier
        );
      }
      throw e;
    }
  }

  /*****************************************************************/
  /************************** UTILITIES ****************************/
  /*****************************************************************/

  public async getNullifier(
    collectionId: number,
    chainId: number,
    account: ImportedAccount
  ): Promise<string> {
    const attester = this.attesters.getAttester(collectionId);
    const internalCollectionId = attester.getInternalCollectionId(collectionId);
    const contractAddress = attester.getAddress(chainId);

    const nullifier = await getNullifier(
      internalCollectionId,
      contractAddress,
      account.seed
    );
    return nullifier;
  }
}
