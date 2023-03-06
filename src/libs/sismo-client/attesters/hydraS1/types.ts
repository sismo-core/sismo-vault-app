export type RegistryTree = {
  root: string;
  metadata: {
    leavesCount: number;
  };
  dataUrl: string;
  treeUrl: string;
};

export type AccountTree = {
  root: string;
  chunk: {
    chunkNumber: number;
    totalChunks: number;
    min: string;
    max: string;
  };
  groupId: string;
  groupProperties: GroupProperties;
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

export type AvailableGroups = {
  registryTree: RegistryTree;
  accountTrees: AccountTree[];
};

export type GroupProperties = {
  internalCollectionId: number;
  generationTimestamp: number;
  isScore: boolean;
  cooldownDuration?: number;
};
