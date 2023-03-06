import { BigNumber } from "ethers";

export type VaultV2 = {
  mnemonics: string[];
  owners: {
    seed: string;
    identifier: string;
  }[];
  sources: {
    identifier: string;
    seed: string;
    commitmentReceipt: [BigNumber, BigNumber, BigNumber];
    commitmentMapperPubKey: [BigNumber, BigNumber];
    type: "ethereum" | "github";
    wallet?: {
      mnemonic: string;
      accountNumber: number;
    }; //If type is not ethereum
    profile?: {
      login: string;
      id: number;
      name: string;
      avatar: string;
    };
  }[];
  destinations: {
    identifier: string;
    seed: string;
    commitmentReceipt: [BigNumber, BigNumber, BigNumber];
    commitmentMapperPubKey: [BigNumber, BigNumber];
  }[];
  settings: {
    name: string;
    autoImportOwners: boolean;
  };
  version: 2;
};
