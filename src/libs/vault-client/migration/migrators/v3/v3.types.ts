import {
  CommitmentMapperPubKey,
  CommitmentReceipt,
} from "../../../../sismo-client";

export type Owner = {
  identifier: string;
  seed: string;
  ens?: {
    name?: string;
    avatar?: string;
  };
  timestamp: number;
};

export type Source = {
  identifier: string;
  seed: string;
  commitmentReceipt: CommitmentReceipt;
  commitmentMapperPubKey: CommitmentMapperPubKey;
  type: AccountType;
  profile?: {
    login: string;
    id: number;
    name: string;
    avatar: string;
  };
  ens?: {
    name?: string;
    avatar?: string;
  };
  wallet?: {
    mnemonic: string;
    accountNumber: number;
  };
  timestamp: number;
};

export type Destination = {
  identifier: string;
  seed: string;
  commitmentReceipt: CommitmentReceipt;
  commitmentMapperPubKey: CommitmentMapperPubKey;
  ens?: {
    name?: string;
    avatar?: string;
  };
  timestamp: number;
};

export type BackupKey = {
  key: string;
  mnemonic: string;
  accountNumber: number;
  valide: boolean;
  name: string;
  timestamp: number;
};

export type AccountType = "ethereum" | "github" | "twitter";

export type VaultV3 = {
  mnemonics: string[];
  backupKeys: BackupKey[];
  owners: Owner[];
  sources: Source[];
  destinations: Destination[];
  settings: {
    name: string;
    autoImportOwners: boolean;
    keepConnected: boolean;
  };
  timestamp: number;
  version: 3;
};
