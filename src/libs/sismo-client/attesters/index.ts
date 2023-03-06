import { Account } from "../types";
import { Attester } from "./attester";
import { Proof, ProofRequest } from "./types";

export class Attesters {
  public attesters: Attester[];

  constructor(attesters: Attester[]) {
    this.attesters = attesters;
  }

  public getAttester(collectionId: number): Attester {
    for (let attester of this.attesters) {
      for (let range of attester.ranges) {
        if (range.first <= collectionId && range.last >= collectionId) {
          return attester;
        }
      }
    }
  }

  public async getEligibleAttestations(
    accounts: Account[],
    collectionIds: number[],
    chainId: number
  ): Promise<{ collectionId: number; owner: string; value: string }[]> {
    const collectionIdByAttester: { [attesterName: string]: number[] } = {};
    const attesters: Attester[] = [];
    for (let collectionId of collectionIds) {
      const attester = this.getAttester(collectionId);
      if (!attester) continue;
      if (collectionIdByAttester[attester.name]) {
        collectionIdByAttester[attester.name].push(collectionId);
      } else {
        attesters.push(attester);
        collectionIdByAttester[attester.name] = [collectionId];
      }
    }
    const eligibleAttestationsPromises = [];
    for (let attesterName of Object.keys(collectionIdByAttester)) {
      const attester = attesters.find((el) => el.name === attesterName);
      eligibleAttestationsPromises.push(
        attester.getEligibleAttestations(
          accounts,
          collectionIdByAttester[attesterName],
          chainId
        )
      );
    }
    const res = await Promise.all(eligibleAttestationsPromises);
    return res.flat();
  }

  public async generateProofs(requests: ProofRequest[]): Promise<Proof[]> {
    //Group requests by attester
    let requestsByAttester: {
      [attesterName: string]: ProofRequest[];
    } = {};

    for (let request of requests) {
      const attester = this.getAttester(request.collectionId);
      if (requestsByAttester[attester.name]) {
        requestsByAttester[attester.name].push(request);
      } else {
        requestsByAttester[attester.name] = [request];
      }
    }

    //Generate proofs by attesters
    const proofsArrays: Proof[][] = await Promise.all(
      Object.keys(requestsByAttester).map((attesterName) => {
        const attester = this.attesters.find(
          (attester) => attester.name === attesterName
        );
        return attester.generateProofs(requestsByAttester[attesterName]);
      })
    );

    return proofsArrays.flat();
  }

  public async generateAttestations(proofs: Proof[]): Promise<void> {
    //Group requests by attester
    let proofsByAttester: {
      [attesterName: string]: Proof[];
    } = {};

    for (let proof of proofs) {
      const attester = this.getAttester(proof.request.collectionId);
      if (proofsByAttester[attester.name]) {
        proofsByAttester[attester.name].push(proof);
      } else {
        proofsByAttester[attester.name] = [proof];
      }
    }

    //Generate attestations
    await Promise.all(
      Object.keys(proofsByAttester).map(async (attesterName) => {
        const attester = this.attesters.find(
          (attester) => attester.name === attesterName
        );
        return attester.generateAttestations(proofsByAttester[attesterName]);
      })
    );
  }
}
