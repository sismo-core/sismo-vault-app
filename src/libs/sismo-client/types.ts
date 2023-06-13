export type AccountType = string;
export type Network = "goerli" | "polygon" | "mumbai" | "gnosis";

export type Account = {
  identifier: string;
};

export type SeedsById = {
  collectionId: number;
  seeds: string[];
};
