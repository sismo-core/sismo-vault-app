import { BigNumber } from "ethers";
import { Ens } from "../../../../sismo-client";

export type ImportedAccount = {
  address: string;
  seed: string;
  commitmentReceipt: [BigNumber, BigNumber, BigNumber];
  commitmentMapperPubKey: [BigNumber, BigNumber];
  isSource: boolean;
  isDestination: boolean;
  ens?: Ens;
};

export type Owner = {
  seed: string;
  address: string;
  ens?: Ens;
};

export type VaultV1 = {
  name: string;
  owners: Owner[];
  importedAccounts: ImportedAccount[];
  autoImportOwners: boolean;
  version: 1;
};
