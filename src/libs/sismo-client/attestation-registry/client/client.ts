import { Listener } from "../provider/on-chain/on-chain-provider";
import { Provider } from "../provider/provider";
import { Filters } from "../provider/types";
import { Attestation } from "../types";

export class AttestationRegistryClient {
  private registryProvider: Provider;
  private listeningQueue: { collectionId: number; identifier: string }[];

  constructor({ registryProvider }: { registryProvider: Provider }) {
    this.registryProvider = registryProvider;
    this.listeningQueue = [];
  }

  public async getAttestations(filters?: Filters): Promise<Attestation[]> {
    let attestations = await this.registryProvider.get();

    if (filters?.nullifiers) {
      attestations = attestations.filter((attestation) =>
        filters.nullifiers.find(
          (nullifier) => nullifier === attestation.extraData.nullifier
        )
      );
    }
    if (filters?.owners) {
      attestations = attestations.filter((attestation) =>
        filters.owners.find((owner) => owner === attestation.owner)
      );
    }
    if (filters?.collectionIds) {
      attestations = attestations.filter((attestation) =>
        filters.collectionIds.find(
          (collectionId) => collectionId === attestation.collectionId
        )
      );
    }
    return attestations;
  }

  public async getHolders(collectionId: number): Promise<number> {
    let attestations = await this.registryProvider.get();
    attestations = attestations.filter(
      (attestation) => attestation.collectionId === collectionId
    );
    return attestations.length;
  }

  public async getTotalUniqueUsers(): Promise<number> {
    let attestations = await this.registryProvider.get();
    let totalUniqueUsers = 0;
    const usersCounted = new Map();
    for (let attestation of attestations) {
      if (usersCounted.has(attestation.owner)) {
        continue;
      }
      totalUniqueUsers++;
      usersCounted.set(attestation.owner, true);
    }
    return totalUniqueUsers;
  }

  public async getTotalAttestations(): Promise<number> {
    let attestations = await this.registryProvider.get();
    return attestations.length;
  }

  public onAttestationRecorded(listener: Listener) {
    this.registryProvider.onAttestationRecorded(listener);
  }

  public addInListeningQueue(collectionId: number, identifier: string) {
    this.registryProvider.startListen();
    this.listeningQueue.push({ collectionId, identifier });
    this.onAttestationRecorded((attestation) => {
      if (
        attestation.collectionId === collectionId &&
        attestation.owner === identifier
      ) {
        this.removeFromListeningQueue(collectionId, identifier);
      }
    });
  }

  public removeFromListeningQueue(collectionId: number, identifier: string) {
    const index = this.listeningQueue.findIndex((el) => {
      return el.collectionId === collectionId && el.identifier === identifier;
    });
    if (index !== -1) {
      this.listeningQueue.splice(index, 1);
    }
    if (this.listeningQueue.length === 0) {
      this.registryProvider.stopListen();
    }
  }
}
