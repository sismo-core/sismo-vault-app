import { Owner, VaultV3 } from ".";
import {
  ethAccount1,
  ethAccount2,
  ethAccount3,
  githubAccount1,
  tweeterAccount1,
} from "../base/accounts";

const owner1: Owner = {
  identifier: ethAccount1.identifier,
  seed: ethAccount1.seed,
  timestamp: 1666532889777,
};

const owner2: Owner = {
  identifier: ethAccount2.identifier,
  seed: ethAccount2.seed,
  timestamp: 1666532889777,
};

const v3Vaults: VaultV3[] = [
  {
    mnemonics: [],
    owners: [owner1],
    sources: [
      {
        ...ethAccount1,
        type: "ethereum",
        timestamp: 1666532889777,
      },
    ],
    destinations: [
      {
        ...ethAccount1,
        timestamp: 1666532889777,
      },
    ],
    settings: {
      name: "My Vault 0",
      autoImportOwners: true,
      keepConnected: true,
    },
    backupKeys: [],
    timestamp: 1666532889777,
    version: 3,
  },
  {
    mnemonics: [],
    owners: [owner1],
    sources: [
      {
        ...ethAccount1,
        type: "ethereum",
        timestamp: 1666532889777,
      },
      {
        ...ethAccount2,
        type: "ethereum",
        timestamp: 1666532889777,
      },
    ],
    destinations: [
      {
        ...ethAccount1,
        timestamp: 1666532889777,
      },
      {
        ...ethAccount2,
        timestamp: 1666532889777,
      },
    ],
    settings: {
      name: "My Vault 1",
      autoImportOwners: true,
      keepConnected: true,
    },
    backupKeys: [],
    timestamp: 1666532889777,
    version: 3,
  },
  {
    mnemonics: [],
    owners: [owner1, owner2],
    sources: [
      {
        ...ethAccount1,
        type: "ethereum",
        timestamp: 1666532889777,
      },
      {
        ...ethAccount3,
        type: "ethereum",
        timestamp: 1666532889777,
      },
    ],
    destinations: [
      {
        ...ethAccount2,
        timestamp: 1666532889777,
      },
      {
        ...ethAccount3,
        timestamp: 1666532889777,
      },
    ],
    settings: {
      name: "My Vault 2",
      autoImportOwners: false,
      keepConnected: true,
    },
    backupKeys: [],
    timestamp: 1666532889777,
    version: 3,
  },
  {
    mnemonics: [
      tweeterAccount1.wallet.mnemonic,
      githubAccount1.wallet.mnemonic,
    ],
    owners: [owner1, owner2],
    sources: [
      {
        ...ethAccount1,
        type: "ethereum",
        timestamp: 1666532889777,
      },
      {
        ...ethAccount3,
        type: "ethereum",
        timestamp: 1666532889777,
      },
      {
        ...tweeterAccount1,
        type: "twitter",
        timestamp: 1666532889777,
      },
      {
        ...githubAccount1,
        type: "github",
        timestamp: 1666532889777,
      },
    ],
    destinations: [
      {
        ...ethAccount2,
        timestamp: 1666532889777,
      },
      {
        ...ethAccount3,
        timestamp: 1666532889777,
      },
    ],
    settings: {
      name: "My Vault 3",
      autoImportOwners: false,
      keepConnected: true,
    },
    backupKeys: [
      {
        key: "0xKey1",
        mnemonic: "key mnemonic 1",
        accountNumber: 1,
        valide: true,
        name: "Backup key 1",
        timestamp: 1666532889777,
      },
    ],
    timestamp: 1666532889777,
    version: 3,
  },
];

export default v3Vaults;
