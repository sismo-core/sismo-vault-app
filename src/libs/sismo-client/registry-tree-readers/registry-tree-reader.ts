import { Cache } from "../caches";
import { ChainNameToId } from "../contracts/commons";
import { fetchAvailableGroups } from "../services/available-data";
import { OffchainAvailableGroups } from "./types";
import { KVMerkleTree, MerkleTreeData } from "@sismo-core/hydra-s2";
import { OffChainAccountTreeMetadata } from "./types";

export abstract class RegistryTreeReader {
  protected _attesterName: string;
  protected _chainName: string;

  constructor({
    attesterName,
    chainName,
  }: {
    cache: Cache;
    attesterName: string;
    chainName: string;
  }) {
    this._attesterName = attesterName;
    this._chainName = chainName;
  }

  protected async getAvailableGroups(): Promise<OffchainAvailableGroups> {
    const { availableGroups } = await fetchAvailableGroups(
      this._attesterName,
      ChainNameToId[this._chainName]
    );
    return availableGroups as OffchainAvailableGroups;
  }

  public abstract getAccountsTree(args: any): Promise<KVMerkleTree>;
  public abstract getRegistryTree(): Promise<KVMerkleTree>;
  public abstract getAccountsTreeEligibility(
    args: any
  ): Promise<MerkleTreeData>;
  protected abstract getAccountsTreeChunk(
    args: any
  ): Promise<OffChainAccountTreeMetadata>;
  protected abstract getGroupAccountsTrees(
    args: any
  ): Promise<OffChainAccountTreeMetadata[]>;
}
