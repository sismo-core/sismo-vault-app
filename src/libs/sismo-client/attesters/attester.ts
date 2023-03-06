import env from "../../../environment";
import { Account } from "../types";
import { Proof, ProofRequest } from "./types";

export type Range = {
  first: number;
  last: number;
};

export abstract class Attester {
  public ranges: Range[];
  public name: string;
  public contract: string;

  constructor({
    ranges,
    name,
    contract,
  }: {
    ranges: Range[];
    name: string;
    contract: string;
  }) {
    this.ranges = ranges;
    this.name = name;
    this.contract = contract;
  }

  abstract getEligibleAttestations(
    accounts: Account[],
    collectionIds: number[],
    chainId: number
  ): Promise<{ collectionId: number; owner: string; value: string }[]>;
  abstract generateProofs(requests: ProofRequest[]): Promise<Proof[]>;
  abstract generateAttestations(
    proofs: Proof[],
    useRelayer?: boolean
  ): Promise<void>;

  abstract getCollectionId(internalCollectionId: number): number;
  public getInternalCollectionId = (collectionId: number) => {
    let first = 0;
    for (let range of this.ranges) {
      first += range.first;
      if (range.first <= collectionId && range.last >= collectionId) {
        return collectionId - first;
      }
    }
  };
  public getAddress = (chainId: number) => {
    return env.contracts[chainId][this.contract].address;
  };
}
