import { Cache } from "../caches";
import { ChainNameToId } from "../contracts/commons";
import { OffchainAvailableGroups } from "./types";
import { KVMerkleTree, MerkleTreeData } from "@sismo-core/hydra-s2";
import { OffChainAccountTreeMetadata } from "./types";

export abstract class RegistryTreeReader {
  public abstract getAccountsTree(args: any): Promise<KVMerkleTree>;
  public abstract getRegistryTree(args: any): Promise<KVMerkleTree>;
  public abstract getAccountsTreeEligibility(
    args: any
  ): Promise<MerkleTreeData>;
}
