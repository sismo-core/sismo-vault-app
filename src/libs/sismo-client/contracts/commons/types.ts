/******************** ATTESTERS *****************/

export type CommitmentMapperPubKey = [string, string];

export type CommitmentReceipt = [string, string, string];

/******************** VAULT **********************/

export type Ens = {
  name?: string;
  avatar?: string;
};

export type Owner = {
  address: string;
  ens?: Ens;
  seed: string;
};
