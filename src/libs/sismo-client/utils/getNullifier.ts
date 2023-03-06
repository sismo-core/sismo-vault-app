import { SNARK_FIELD } from "@sismo-core/crypto";
import { buildPoseidon } from "@sismo-core/hydra-s1";
import { BigNumber, ethers } from "ethers";
import { CommitmentMapper } from "../../vault-client/commitment-mapper";

const encodeTicketIdentifier = (address: string, groupIndex: number) => {
  return BigNumber.from(
    ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256"],
        [address, groupIndex]
      )
    )
  ).mod(BigNumber.from(SNARK_FIELD));
};

let poseidon = null;
const cache = new Map();
export const getNullifier = async (
  internalCollectionId: number,
  contractAddress: string,
  seed: string
) => {
  const key = `${internalCollectionId}_${contractAddress}_${seed}`;
  if (cache.has(key)) {
    return cache.get(key);
  }
  if (!poseidon) poseidon = await buildPoseidon();
  const externalNullifier = encodeTicketIdentifier(
    contractAddress,
    internalCollectionId
  );
  const commitmentMapperSecret =
    CommitmentMapper.generateCommitmentMapperSecret(seed);
  const secretHash = poseidon([commitmentMapperSecret, 1]);
  const nullifier = poseidon([secretHash, externalNullifier]);
  cache.set(key, nullifier);
  return nullifier;
};
