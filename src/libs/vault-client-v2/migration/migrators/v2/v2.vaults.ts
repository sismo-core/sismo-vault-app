import { VaultV2 } from ".";
import { ethAccount1, ethAccount2, ethAccount3 } from "../base/accounts";

type Owner = {
  seed: string;
  identifier: string;
};

type ImportedAccount = {
  identifier: string;
  seed: string;
  commitmentReceipt: [string, string, string];
  commitmentMapperPubKey: [string, string];
};

const owner1: Owner = {
  identifier: ethAccount1.identifier,
  seed: ethAccount1.seed,
};

const owner2: Owner = {
  identifier: ethAccount2.identifier,
  seed: ethAccount2.seed,
};

const importedAccount1: ImportedAccount = ethAccount1;

const importedAccount2: ImportedAccount = ethAccount2;

const importedAccount3: ImportedAccount = ethAccount3;

const v2Vaults: VaultV2[] = [
  {
    mnemonics: [],
    owners: [owner1],
    sources: [
      {
        ...importedAccount1,
        type: "ethereum",
      },
    ],
    destinations: [importedAccount1],
    settings: {
      name: "My Vault 0",
      autoImportOwners: true,
    },
    version: 2,
  },
  {
    mnemonics: [],
    owners: [owner1],
    sources: [
      {
        ...importedAccount1,
        type: "ethereum",
      },
      {
        ...importedAccount2,
        type: "ethereum",
      },
    ],
    destinations: [importedAccount1, importedAccount2],
    settings: {
      name: "My Vault 1",
      autoImportOwners: true,
    },
    version: 2,
  },
  {
    mnemonics: [],
    owners: [owner1, owner2],
    sources: [
      {
        ...importedAccount1,
        type: "ethereum",
      },
      {
        ...importedAccount3,
        type: "ethereum",
      },
    ],
    destinations: [importedAccount2, importedAccount3],
    settings: {
      name: "My Vault 2",
      autoImportOwners: false,
    },
    version: 2,
  },
];

export default v2Vaults;
