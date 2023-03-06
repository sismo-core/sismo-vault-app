import { ethers } from "ethers";

export const decodeExtraData = (
  extraData: string
): { nullifier?: string; rawExtraData: string } => {
  try {
    const nullifier = ethers.utils.defaultAbiCoder
      .decode(
        ["uint256"],
        ethers.utils.defaultAbiCoder.decode(["bytes", "uint16"], extraData)[0]
      )
      .toString();
    return {
      nullifier,
      rawExtraData: extraData,
    };
  } catch (e) {
    console.error(e);
  }
  return {
    nullifier: null,
    rawExtraData: extraData,
  };
};
