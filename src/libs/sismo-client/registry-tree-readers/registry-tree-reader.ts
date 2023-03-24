import { Cache } from "../caches";
import { ChainNameToId } from "../contracts/commons";
import { OffchainAvailableGroups } from "./types";
import { KVMerkleTree, MerkleTreeData } from "@sismo-core/hydra-s2";
import { OffChainAccountTreeMetadata } from "./types";
import { DevConfig, DevGroup } from "../zk-connect-prover/zk-connect-v2";
import {
  GetAccountsTreeInputs,
  GetAccountsTreeEligibilityInputs,
} from "./types";

export abstract class RegistryTreeReader {
  public abstract getAccountsTree(
    args: GetAccountsTreeInputs | DevGroup
  ): Promise<KVMerkleTree>;
  public abstract getRegistryTree(
    args: DevGroup[] | null
  ): Promise<KVMerkleTree>;
  public abstract getAccountsTreeEligibility(
    args: GetAccountsTreeEligibilityInputs | DevGroup
  ): Promise<MerkleTreeData>;
}
