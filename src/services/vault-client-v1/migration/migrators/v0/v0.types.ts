export type VaultV0 = {
  name: string;
  importedAccounts: {
    address: string;
    seed: string;
    commitmentReceipt: [string, string, string];
    commitmentMapperPubKey: [string, string];
    isOwner?: boolean;
    isAdmin?: boolean;
  }[];
  version?: 0;
};
