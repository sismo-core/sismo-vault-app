import { Owner, VaultV4 } from ".";
import {
  ethAccount1,
  ethAccount2,
  ethAccount3,
  githubAccount1,
  recoveryKey1,
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

const importedAccount1 = ethAccount1;

const importedAccount2 = ethAccount2;

const importedAccount3 = ethAccount3;

const v4Vaults: VaultV4[] = [
  {
    mnemonics: [],
    owners: [owner1],
    importedAccounts: [
      {
        ...importedAccount1,
        type: "ethereum",
        timestamp: 1666532889777,
      },
    ],
    settings: {
      name: "My Vault 0",
      autoImportOwners: true,
      keepConnected: true,
    },
    recoveryKeys: [],
    timestamp: 1666532889777,
    version: 4,
  },
  {
    mnemonics: [],
    owners: [owner1],
    importedAccounts: [
      {
        ...importedAccount1,
        type: "ethereum",
        timestamp: 1666532889777,
      },
      {
        ...importedAccount2,
        type: "ethereum",
        timestamp: 1666532889777,
      },
    ],
    settings: {
      name: "My Vault 1",
      autoImportOwners: true,
      keepConnected: true,
    },
    recoveryKeys: [],
    timestamp: 1666532889777,
    version: 4,
  },
  {
    mnemonics: [],
    owners: [owner1, owner2],
    importedAccounts: [
      {
        ...importedAccount1,
        type: "ethereum",
        timestamp: 1666532889777,
      },
      {
        ...importedAccount3,
        type: "ethereum",
        timestamp: 1666532889777,
      },
      {
        ...importedAccount2,
        type: "ethereum",
        timestamp: 1666532889777,
      },
    ],
    settings: {
      name: "My Vault 2",
      autoImportOwners: false,
      keepConnected: true,
    },
    recoveryKeys: [],
    timestamp: 1666532889777,
    version: 4,
  },
  {
    mnemonics: [
      tweeterAccount1.wallet.mnemonic,
      githubAccount1.wallet.mnemonic,
    ],
    owners: [owner1, owner2],
    importedAccounts: [
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
      {
        ...ethAccount2,
        type: "ethereum",
        timestamp: 1666532889777,
      },
    ],
    settings: {
      name: "My Vault 3",
      autoImportOwners: false,
      keepConnected: true,
    },
    recoveryKeys: [
      {
        ...recoveryKey1,
        timestamp: 1666532889777,
      },
    ],
    timestamp: 1666532889777,
    version: 4,
  },
];

export default v4Vaults;
