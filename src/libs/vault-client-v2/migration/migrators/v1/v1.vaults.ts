import { VaultV1 } from ".";
import { ethAccount1, ethAccount2, ethAccount3 } from "../base/accounts";

type Owner = {
  seed: string;
  address: string;
};

type ImportedAccount = {
  address: string;
  seed: string;
  commitmentReceipt: [string, string, string];
  commitmentMapperPubKey: [string, string];
  isSource: boolean;
  isDestination: boolean;
};

const owner1: Owner = {
  address: ethAccount1.identifier,
  seed: ethAccount1.seed,
};

const owner2: Owner = {
  address: ethAccount2.identifier,
  seed: ethAccount2.seed,
};

const importedAccount1: ImportedAccount = {
  address: ethAccount1.identifier,
  seed: ethAccount1.seed,
  commitmentReceipt: ethAccount1.commitmentReceipt,
  commitmentMapperPubKey: ethAccount1.commitmentMapperPubKey,
  isSource: true,
  isDestination: true,
};

const importedAccount2: ImportedAccount = {
  address: ethAccount2.identifier,
  seed: ethAccount2.seed,
  commitmentReceipt: ethAccount2.commitmentReceipt,
  commitmentMapperPubKey: ethAccount2.commitmentMapperPubKey,
  isSource: true,
  isDestination: true,
};

const importedAccount3: ImportedAccount = {
  address: ethAccount3.identifier,
  seed: ethAccount3.seed,
  commitmentReceipt: ethAccount3.commitmentReceipt,
  commitmentMapperPubKey: ethAccount3.commitmentMapperPubKey,
  isSource: true,
  isDestination: true,
};

const v1Vaults: VaultV1[] = [
  {
    name: "My Vault 0",
    importedAccounts: [importedAccount1],
    owners: [owner1],
    autoImportOwners: true,
    version: 1,
  },
  {
    name: "My Vault 1",
    importedAccounts: [importedAccount1, importedAccount2],
    owners: [owner1],
    autoImportOwners: true,
    version: 1,
  },
  {
    name: "My Vault 2",
    importedAccounts: [
      {
        ...importedAccount1,
        isSource: true,
        isDestination: false,
      },
      {
        ...importedAccount2,
        isSource: false,
        isDestination: true,
      },
      importedAccount3,
    ],
    owners: [owner1, owner2],
    autoImportOwners: false,
    version: 1,
  },
];

export default v1Vaults;
