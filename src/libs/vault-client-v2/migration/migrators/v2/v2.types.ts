export type VaultV2 = {
  mnemonics: string[];
  owners: {
    seed: string;
    identifier: string;
  }[];
  sources: {
    identifier: string;
    seed: string;
    commitmentReceipt: [string, string, string];
    commitmentMapperPubKey: [string, string];
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
    commitmentReceipt: [string, string, string];
    commitmentMapperPubKey: [string, string];
  }[];
  settings: {
    name: string;
    autoImportOwners: boolean;
  };
  version: 2;
};
