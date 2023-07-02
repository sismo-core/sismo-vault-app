import { KVMerkleTree, MerkleTreeData } from "@sismo-core/hydra-s3";
import { BigNumberish } from "ethers";

export abstract class RegistryTreeReaderBase {
  public abstract getAccountsTree(inputs: OffchainGetAccountsTreeInputs): Promise<KVMerkleTree>;

  public abstract getRegistryTree(): Promise<KVMerkleTree>;

  public abstract getAccountsTreeEligibility(
    inputs: OffchainGetAccountsTreeEligibilityInputs
  ): Promise<MerkleTreeData>;
}

export type RegistryTree = {
  root: string;
  metadata: {
    leavesCount: number;
  };
  dataUrl: string;
  treeUrl: string;
};

export type DevAddresses = string[] | Record<string, Number | BigNumberish>;

export type OffchainGetAccountsTreeInputs = {
  groupId: string;
  timestamp: number | "latest";
  account: string;
};

export type OffchainGetAccountsTreeEligibilityInputs = {
  groupId: string;
  timestamp: number | "latest";
  accounts: string[];
};

export type OffChainGroupProperties = {
  groupId: string;
  timestamp: number | "latest";
};

export type OffChainAccountTreeMetadata = {
  root: string;
  chunk: {
    chunkNumber: number;
    totalChunks: number;
    min: string;
    max: string;
  };
  groupProperties: OffChainGroupProperties;
  metadata: {
    groupName: string;
    groupGenerationTimestamp: number;
    leavesCount: number;
    groupDataUrl: string;
  };
  dataUrl: string;
  treeUrl: string;
  treeCompressedV1Url: string;
};

export type AvailableData = {
  attesterName: string;
  identifier: string;
  isOnChain: boolean;
  network: string;
  timestamp: number;
  transactionHash: string;
  url: string;
};

export type OffchainAvailableGroups = {
  registryTree: RegistryTree;
  accountTrees: OffChainAccountTreeMetadata[];
};
