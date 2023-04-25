import { BigNumber } from "ethers";

export type VaultV0 = {
  name: string;
  importedAccounts: {
    address: string;
    seed: string;
    commitmentReceipt: [BigNumber, BigNumber, BigNumber];
    commitmentMapperPubKey: [BigNumber, BigNumber];
    isOwner?: boolean;
    isAdmin?: boolean;
  }[];
  version?: 0;
};
