import { EddsaSignature, EddsaPublicKey } from "@sismo-core/crypto";

/******************** ATTESTERS *****************/

export type CommitmentMapperPubKey = EddsaPublicKey;

export type CommitmentReceipt = EddsaSignature;

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
