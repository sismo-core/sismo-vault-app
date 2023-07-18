import { buildPoseidon } from "@sismo-core/crypto";

let poseidonPromise = null;

export const getPoseidon = async () => {
  if (!poseidonPromise) poseidonPromise = await buildPoseidon();
  return await poseidonPromise;
};
