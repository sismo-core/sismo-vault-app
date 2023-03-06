import { ImportedAccount } from "../../vault-client";

export type ProofRequest = {
  sources: ImportedAccount[];
  destination: ImportedAccount;
  collectionId: number;
  value: string;
  chainId: number;
};

export type Proof = {
  claim: Claim;
  request: ProofRequest;
  proofData: string;
};

export type Claim = {
  groupId: string;
  claimedValue: number;
  extraData: string;
};
