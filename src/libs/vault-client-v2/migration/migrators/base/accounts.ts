type EthAccount = {
  identifier: string;
  seed: string;
  commitmentReceipt: [string, string, string];
  commitmentMapperPubKey: [string, string];
};

type Web2Account = {
  identifier: string;
  seed: string;
  commitmentReceipt: [string, string, string];
  commitmentMapperPubKey: [string, string];
  wallet: {
    mnemonic: string;
    accountNumber: number;
  };
};

export const ethAccount1: EthAccount = {
  identifier: "0x1",
  seed: "0xseed1",
  commitmentReceipt: ["0x1", "0x2", "0x3"] as [string, string, string],
  commitmentMapperPubKey: ["0x4", "0x3"] as [string, string],
};

export const ethAccount2: EthAccount = {
  identifier: "0x2",
  seed: "0xseed2",
  commitmentReceipt: ["0x5", "0x6", "0x7"] as [string, string, string],
  commitmentMapperPubKey: ["0x8", "0x9"] as [string, string],
};

export const ethAccount3: EthAccount = {
  identifier: "0x3",
  seed: "0xseed3",
  commitmentReceipt: ["0x10", "0x11", "0x12"] as [string, string, string],
  commitmentMapperPubKey: ["0x13", "0x14"] as [string, string],
};

export const githubAccount1: Web2Account = {
  identifier: "0xgithub1",
  seed: "0xgithubSeed1",
  commitmentReceipt: ["0x10", "0x11", "0x12"] as [string, string, string],
  commitmentMapperPubKey: ["0x13", "0x14"] as [string, string],
  wallet: {
    mnemonic: "github mnemonic number 1",
    accountNumber: 1,
  },
};

export const tweeterAccount1: Web2Account = {
  identifier: "0xtwitter1",
  seed: "0xtwitterSeed1",
  commitmentReceipt: ["0x10", "0x11", "0x12"] as [string, string, string],
  commitmentMapperPubKey: ["0x13", "0x14"] as [string, string],
  wallet: {
    mnemonic: "tweeter mnemonic number 1",
    accountNumber: 1,
  },
};

export const recoveryKey1 = {
  key: "0xKey1",
  mnemonic: "key mnemonic 1",
  accountNumber: 1,
  valid: true,
  name: "Backup key 1",
};
