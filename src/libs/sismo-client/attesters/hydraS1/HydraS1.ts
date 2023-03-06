import {
  KVMerkleTree,
  MerkleTreeData,
  SNARK_FIELD,
} from "@sismo-core/hydra-s1";
import { BigNumber, ethers } from "ethers";
import { Account, ApiRequestType, RelayerByChain } from "../..";
import { RequestStruct } from "../../contracts/commons/typechain";
import {
  HydraS1Proof,
  HydraS1ProofRequest,
  HydraS1ZKPS,
} from "../proving-schemes";
import {
  fetchAvailableGroups,
  fetchJsonTree,
} from "../../services/available-data";
import { Attester, Range } from "../attester";
import { Proof, ProofRequest } from "../types";
import { ChunkedGroups } from "./chunked-groups";
import { Cache } from "../../caches";
import { AccountTree, AvailableGroups } from "./types";

export abstract class HydraS1 extends Attester {
  private provingScheme: HydraS1ZKPS;
  private relayers: RelayerByChain;
  private chunkedGroups: ChunkedGroups;

  constructor({
    ranges,
    name,
    contract,
    relayers,
    cache,
  }: {
    ranges: Range[];
    name: string;
    contract: string;
    relayers: RelayerByChain;
    cache: Cache;
  }) {
    super({
      ranges,
      name,
      contract,
    });
    this.chunkedGroups = new ChunkedGroups({
      cache,
    });
    this.provingScheme = new HydraS1ZKPS();
    this.relayers = relayers;
  }

  public async getEligibleAttestations(
    accounts: Account[],
    collectionIds: number[],
    chainId: number
  ): Promise<{ collectionId: number; owner: string; value: string }[]> {
    // Get all dataUrl by collectionId
    const dataUrlByCollectionId: {
      [collectionId: number]: { [identifier: string]: string };
    } = {};
    const { availableGroups } = await fetchAvailableGroups(this.name, chainId);
    if (!availableGroups) return;
    let accountTrees = availableGroups.accountTrees as AccountTree[];

    for (let account of accounts) {
      //Get account tree chunk where the identifier is between chunk min and max
      const accountTreesInRange = accountTrees.filter((accountTree) => {
        if (accountTree.chunk.max && accountTree.chunk.min) {
          if (
            account.identifier <= accountTree.chunk.max &&
            account.identifier >= accountTree.chunk.min
          ) {
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      });

      //Get dataUrl by accountTree if the accountTree concern
      for (let accountTreeInRange of accountTreesInRange) {
        const collectionId = this.getCollectionId(
          accountTreeInRange.groupProperties.internalCollectionId
        );
        if (collectionIds.includes(collectionId)) {
          if (!dataUrlByCollectionId[collectionId])
            dataUrlByCollectionId[collectionId] = {};
          dataUrlByCollectionId[collectionId][account.identifier] =
            accountTreeInRange.dataUrl;
        }
      }
    }

    // Regroup all dataUrl
    const dataUrls: string[] = [];
    for (let collectionId of Object.keys(dataUrlByCollectionId)) {
      for (let identifier of Object.keys(dataUrlByCollectionId[collectionId])) {
        const dataUrl = dataUrlByCollectionId[collectionId][identifier];
        if (!dataUrls.includes(dataUrl)) {
          dataUrls.push(dataUrl);
        }
      }
    }

    const dataArrays = await Promise.all(
      dataUrls.map((dataUrl) => this.chunkedGroups.get(dataUrl))
    );

    const dataByDataUrl: { [dataUrl: string]: MerkleTreeData } = {};
    for (let [index, data] of dataArrays.entries()) {
      dataByDataUrl[dataUrls[index]] = data;
    }

    const res: { collectionId: number; owner: string; value: string }[] = [];
    for (let collectionId of Object.keys(dataUrlByCollectionId)) {
      for (let identifier of Object.keys(dataUrlByCollectionId[collectionId])) {
        const dataUrl = dataUrlByCollectionId[collectionId][identifier];
        const data = dataByDataUrl[dataUrl];
        if (data[identifier]) {
          const value = BigNumber.from(data[identifier]).toString();
          res.push({
            collectionId: Number(collectionId),
            owner: identifier,
            value,
          });
        }
      }
    }

    return res;
  }

  public async generateProofs(requests: ProofRequest[]): Promise<Proof[]> {
    const { availableGroups } = await fetchAvailableGroups(
      this.name,
      requests[0].chainId,
      true
    );

    const registryTreeJson = await fetchJsonTree(
      availableGroups.registryTree.treeUrl
    );
    const registryTree = KVMerkleTree.fromJson(registryTreeJson);

    const hydraRequests: HydraS1ProofRequest[] = [];
    for (let request of requests) {
      const internalCollectionId = this.getInternalCollectionId(
        request.collectionId
      );
      const externalNullifier = this.getExternalNullifier(
        internalCollectionId,
        request.chainId
      );

      const accountsTree = await this.getAccountsTree(
        availableGroups as AvailableGroups,
        request.sources[0].identifier,
        internalCollectionId
      );

      const availableAccountsTree = this.getAccountsTreeInRange(
        availableGroups as AvailableGroups,
        request.sources[0].identifier,
        internalCollectionId
      );
      const isStrict = !availableAccountsTree.groupProperties.isScore;
      const groupProperties = availableAccountsTree.groupProperties;
      const groupId = availableAccountsTree.groupId;

      hydraRequests.push({
        groupProperties,
        groupId,
        registryTree,
        accountsTree,
        isStrict,
        sources: request.sources,
        destination: request.destination,
        externalNullifier,
        value: request.value,
        internalCollectionId,
        chainId: request.chainId,
      });
    }

    const hydraProofs: HydraS1Proof[] = await this.provingScheme.generateProofs(
      hydraRequests,
      availableGroups as AvailableGroups
    );

    return hydraProofs.map((proof, index) => {
      return {
        claim: proof.claim,
        proofData: proof.proofData,
        request: requests[index],
      };
    });
  }

  private getAccountsTree = async (
    availableGroups: AvailableGroups,
    identifier: string,
    internalCollectionId: number
  ): Promise<KVMerkleTree> => {
    const accountsTreeInRange = this.getAccountsTreeInRange(
      availableGroups,
      identifier,
      internalCollectionId
    );
    //Check eligibility
    const data = await this.chunkedGroups.get(accountsTreeInRange.dataUrl);
    if (!data[identifier]) {
      throw new Error(
        `Identifier ${identifier} is not eligible to internalCollectionID ${internalCollectionId}`
      );
    }
    const registryTreeJson = await fetchJsonTree(accountsTreeInRange.treeUrl);
    return KVMerkleTree.fromJson(registryTreeJson);
  };

  private getAccountsTreeInRange = (
    availableGroups: AvailableGroups,
    identifier: string,
    internalCollectionId: number
  ): AccountTree => {
    const accountsTrees = availableGroups.accountTrees;

    const accountsTreesFiltered = accountsTrees.filter(
      (account) =>
        account.groupProperties.internalCollectionId === internalCollectionId
    );

    //Filter the chunk with the identifier
    const accountsTreesInRange = accountsTreesFiltered.filter((accountTree) => {
      if (accountTree.chunk.max && accountTree.chunk.min) {
        if (
          identifier <= accountTree.chunk.max &&
          identifier >= accountTree.chunk.min
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    });

    if (accountsTreesInRange.length > 1) {
      throw new Error("Attester groups error");
    }

    return accountsTreesInRange[0];
  };

  public async generateAttestations(
    proofs: Proof[],
    sendTransaction?: boolean
  ): Promise<void> {
    if (sendTransaction) {
      //TODO Add call contract to bypass relayer
      return;
    }

    let apiRequestsByChain: { [chainId: number]: ApiRequestType } = {};

    for (let proof of proofs) {
      const chainId = proof.request.chainId;
      const request: RequestStruct = {
        claims: [proof.claim],
        destination: proof.request.destination.identifier,
      };

      if (!apiRequestsByChain[chainId]) {
        apiRequestsByChain[chainId] = {
          attesterAddresses: [],
          attestationRequests: [],
          proofBytes: [],
        };
      }
      apiRequestsByChain[chainId].attesterAddresses.push(
        this.getAddress(chainId)
      );
      apiRequestsByChain[chainId].attestationRequests.push(request);
      apiRequestsByChain[chainId].proofBytes.push(proof.proofData);
    }

    for (let key of Object.keys(apiRequestsByChain)) {
      const chainId = Number(key);
      const relayerData = await this.relayers[chainId].createAttestations(
        apiRequestsByChain[chainId],
        chainId
      );
      if (relayerData.status === "error") {
        throw new Error(relayerData.message);
      }
    }
  }

  public getExternalNullifier = (
    internalCollectionId: number,
    chainId: number
  ) => {
    const attesterAddress = this.getAddress(chainId);
    return BigNumber.from(
      ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256"],
          [attesterAddress, internalCollectionId]
        )
      )
    ).mod(BigNumber.from(SNARK_FIELD));
  };

  public getCollectionId = (internalCollectionId: number): number => {
    return internalCollectionId + this.ranges[0].first;
  };
}
