import axios from "axios";
import env from "../../../environment";
import { Attestation } from "../attestation-registry/types";

const cacheAttestations = new Map();
export const getAttestations = async (
  chainId: number
): Promise<{ attestations: Attestation[]; block: number }> => {
  let key = `${chainId}`;

  if (!cacheAttestations.has(key)) {
    cacheAttestations.set(
      key,
      axios.get(`${env.s3SubgraphAPIUrls[chainId]}/attestations/latest.json`)
    );
  }
  const res = await cacheAttestations.get(key);
  return {
    attestations: res.data.attestations,
    block: res.data.block.number,
  };
};
