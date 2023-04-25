import { VaultV0 } from ".";
import { ethAccount1, ethAccount2 } from "../base/accounts";

const importedAccount1 = {
  address: ethAccount1.identifier,
  seed: ethAccount1.seed,
  commitmentReceipt: ethAccount1.commitmentReceipt,
  commitmentMapperPubKey: ethAccount1.commitmentMapperPubKey,
  isOwner: true,
  isAdmin: true,
};

const importedAccount2 = {
  address: ethAccount2.identifier,
  seed: ethAccount2.seed,
  commitmentReceipt: ethAccount2.commitmentReceipt,
  commitmentMapperPubKey: ethAccount2.commitmentMapperPubKey,
  isOwner: false,
  isAdmin: false,
};

const vOVaults: VaultV0[] = [
  {
    name: "My Vault 0",
    importedAccounts: [importedAccount1],
    version: 0,
  },
  {
    name: "My Vault 1",
    importedAccounts: [importedAccount1, importedAccount2],
    version: 0,
  },
];

export default vOVaults;
