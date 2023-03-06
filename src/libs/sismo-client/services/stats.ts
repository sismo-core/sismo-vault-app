import { getAttestations } from "./s3AttestationCache";

export const getNumberOfHolders = async (
  collectionId: number,
  chainId: number
) => {
  const { attestations } = await getAttestations(chainId);
  return attestations.filter(
    (attestation) => attestation.collectionId === collectionId
  ).length;
};

export const getTotalBadgeMinted = async (chainIds: number[]) => {
  let totalBadgeMinted = 0;
  for (let chainId of chainIds) {
    const { attestations } = await getAttestations(chainId);
    totalBadgeMinted += attestations.length;
  }
  return totalBadgeMinted;
};

export const getTotalUniqueUsers = async (chainIds: number[]) => {
  const usersCounted = new Map();
  let totalUniqueUsers = 0;
  for (let chainId of chainIds) {
    const { attestations } = await getAttestations(chainId);
    for (let attestation of attestations) {
      if (!usersCounted.has(attestation.owner)) {
        usersCounted.set(attestation.owner, true);
        totalUniqueUsers++;
      }
    }
  }
  return totalUniqueUsers;
};
