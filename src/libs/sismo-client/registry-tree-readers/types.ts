import { BigNumberish } from "ethers";
import { devAddressesType } from "../provers/types";

export type RegistryTree = {
  root: string;
  metadata: {
    leavesCount: number;
  };
  dataUrl: string;
  treeUrl: string;
};

export type getAccountsTreeInputs = OffChainGroupProperties & {
  account: string;
};

export type DevAddresses = string[] | Record<string, Number | BigNumberish>;

export type getAccountsTreeEligibilityInputs = OffChainGroupProperties & {
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
