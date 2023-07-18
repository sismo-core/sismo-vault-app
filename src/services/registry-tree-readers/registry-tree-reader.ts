import { KVMerkleTree, MerkleTreeData } from "@sismo-core/hydra-s3";
import {
  OffchainGetAccountsTreeInputs,
  OffchainGetAccountsTreeEligibilityInputs,
  OffChainAccountTreeMetadata,
  OffChainGroupProperties,
  RegistryTreeReaderBase,
} from "./types";
import { Cache } from "../cache-service";
import env from "../../environment";
import { ChunkedGroups } from "./chunked-groups";
import { fetchCompressedTreeV1, fetchJsonTree } from "./services/available-data";
import { fetchAvailableGroups } from "./services/available-data";
import { ChainNameToId } from "../sismo-client/contracts/commons";
import { OffchainAvailableGroups } from "./types";

export class RegistryTreeReader extends RegistryTreeReaderBase {
  private _chunkedGroups: ChunkedGroups;
  private _attesterName: string;
  private _chainName: string;

  constructor({ cache }: { cache: Cache }) {
    super();
    this._attesterName = "hydra-s2";
    this._chainName = env.chainName;
    this._chunkedGroups = new ChunkedGroups({ cache });
  }

  public async getAccountsTree({
    groupId,
    timestamp,
    account,
  }: OffchainGetAccountsTreeInputs): Promise<KVMerkleTree> {
    const accountsTreeChunk = await this.getAccountsTreeChunk({
      groupId,
      timestamp,
      account,
    });

    if (accountsTreeChunk.treeCompressedV1Url) {
      const accountsTreeCompressed = await fetchCompressedTreeV1(
        accountsTreeChunk.treeCompressedV1Url
      );
      const accountsTree = KVMerkleTree.fromTreeOptimizedFormatV1(accountsTreeCompressed);
      return accountsTree;
    } else {
      const registryTreeJson = await fetchJsonTree(accountsTreeChunk.treeUrl);
      const accountsTree = KVMerkleTree.fromJson(registryTreeJson);
      return accountsTree;
    }
  }

  public async getRegistryTree(): Promise<KVMerkleTree> {
    const availableGroups = await this.getAvailableGroups();
    const registryTreeJson = await fetchJsonTree(availableGroups.registryTree.treeUrl);

    const registryTree = KVMerkleTree.fromJson(registryTreeJson);
    return registryTree;
  }

  public async getAccountsTreeEligibility({
    groupId,
    timestamp,
    accounts,
  }: OffchainGetAccountsTreeEligibilityInputs): Promise<MerkleTreeData> {
    const merkleTreesData = await Promise.all(
      accounts.map(async (account) => {
        const accountsTreeChunk = await this.getAccountsTreeChunk({
          groupId,
          timestamp,
          account,
        });

        if (!accountsTreeChunk) {
          return {};
        }

        const merkleTreeData = await this._chunkedGroups.get(accountsTreeChunk.dataUrl);

        for (const key in merkleTreeData) {
          if (key.toLowerCase() === account.toLowerCase()) {
            return { [account]: merkleTreeData[key] };
          }
        }
      })
    );

    const consolidatedEligibleTreeData = merkleTreesData.reduce((acc, curr) => {
      return {
        ...acc,
        ...curr,
      };
    }, {});

    return consolidatedEligibleTreeData;
  }

  protected async getAccountsTreeChunk({
    groupId,
    timestamp,
    account,
  }: OffchainGetAccountsTreeInputs): Promise<OffChainAccountTreeMetadata> {
    const groupAccountsTrees = await this.getGroupAccountsTrees({
      groupId,
      timestamp,
    });

    //Filter the chunk with the identifier
    const accountsTreesChunk = groupAccountsTrees.filter((accountTree) => {
      if (accountTree.chunk.max && accountTree.chunk.min) {
        return account <= accountTree.chunk.max && account >= accountTree.chunk.min;
      } else {
        return true;
      }
    });

    if (accountsTreesChunk?.length > 1) {
      throw new Error("Registry tree reader error");
    }
    return accountsTreesChunk[0];
  }

  protected async getGroupAccountsTrees({
    groupId,
    timestamp,
  }: OffChainGroupProperties): Promise<OffChainAccountTreeMetadata[]> {
    const availableGroups = await this.getAvailableGroups();
    const accountsTrees = availableGroups.accountTrees;

    //Filter the chunk with the groupId && timestamp
    const filteredAccountsTrees = accountsTrees.filter((accountTree) => {
      return (
        accountTree.groupProperties.groupId === groupId &&
        accountTree.groupProperties.timestamp === timestamp
      );
    });

    if (!filteredAccountsTrees.length) {
      throw new Error(
        `GroupSnapshot with groupId ${groupId} and timestamp ${timestamp} not found in Registry tree ${availableGroups?.registryTree?.root}`
      );
    }

    return filteredAccountsTrees;
  }

  protected async getAvailableGroups(): Promise<OffchainAvailableGroups> {
    const { availableGroups } = await fetchAvailableGroups(
      this._attesterName,
      ChainNameToId[this._chainName]
    );
    return availableGroups as OffchainAvailableGroups;
  }
}
