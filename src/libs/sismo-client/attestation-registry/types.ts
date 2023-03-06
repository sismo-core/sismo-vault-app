export type Attestation = {
  collectionId: number;
  owner: string;
  issuer: string;
  value: string;
  timestamp: number;
  extraData: {
    nullifier?: string;
  };
};
