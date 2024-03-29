import {
  CommitmentMapperPubKey,
  CommitmentReceipt,
} from "../../../../sismo-client";

export type Owner = {
  identifier: string;
  seed: string;
  timestamp: number;
  ens?: {
    name?: string;
    avatar?: string;
  };
};

export type Profile = {
  login: string;
  id: number;
  name: string;
  avatar: string;
};

export type ImportedAccount = {
  identifier: string;
  seed: string;
  commitmentReceipt: CommitmentReceipt;
  commitmentMapperPubKey: CommitmentMapperPubKey;
  type: AccountType;
  profile?: Profile;
  wallet?: {
    mnemonic: string;
    accountNumber: number;
  };
  timestamp: number;
  ens?: {
    name?: string;
    avatar?: string;
  };
};

export type RecoveryKey = {
  key: string;
  mnemonic: string;
  accountNumber: number;
  valid: boolean;
  name: string;
  timestamp: number;
};

export type AccountType = string;
export type VaultNamespaceInputs = {
  appId: string;
  derivationKey?: string;
};

export type VaultV4 = {
  mnemonics: string[];
  recoveryKeys: RecoveryKey[];
  owners: Owner[];
  importedAccounts: ImportedAccount[];
  settings: {
    name: string;
    autoImportOwners: boolean;
    keepConnected: boolean;
  };
  timestamp: number;
  version: 4;
};
