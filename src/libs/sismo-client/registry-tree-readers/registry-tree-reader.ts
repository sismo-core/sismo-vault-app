import { KVMerkleTree, MerkleTreeData } from "@sismo-core/hydra-s2";
import {
  OffchainGetAccountsTreeInputs,
  OffchainGetAccountsTreeEligibilityInputs,
} from "./types";

export abstract class RegistryTreeReader {
  public abstract getAccountsTree(
    inputs: OffchainGetAccountsTreeInputs
  ): Promise<KVMerkleTree>;

  public abstract getRegistryTree(): Promise<KVMerkleTree>;

  public abstract getAccountsTreeEligibility(
    inputs: OffchainGetAccountsTreeEligibilityInputs
  ): Promise<MerkleTreeData>;
}
