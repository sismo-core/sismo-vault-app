import { buildPoseidon } from "@sismo-core/crypto";
import { CommitmentMapper } from "../../../commitment-mapper";
import { ImportedAccount } from "../../../vault-client-v1";

let poseidon = null;

export const getS1Commitment = async (account: ImportedAccount) => {
  poseidon = poseidon ?? (await buildPoseidon());
  const oldAccountSecret = CommitmentMapper.generateCommitmentMapperSecret(
    account.seed
  );
  const oldCommitmentSecret = [oldAccountSecret];
  return poseidon(oldCommitmentSecret).toHexString();
};

export const getS2Commitment = async (
  account: ImportedAccount,
  vaultSecret: string
) => {
  poseidon = poseidon ?? (await buildPoseidon());
  const newAccountSecret = CommitmentMapper.generateCommitmentMapperSecret(
    account.seed
  );
  const newCommitmentSecret = [vaultSecret, newAccountSecret];
  return poseidon(newCommitmentSecret).toHexString();
};
