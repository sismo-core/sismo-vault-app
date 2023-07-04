import { BigNumber } from "ethers";
import { formatToEther } from "./formatToEther";
import { parseEther } from "ethers/lib/utils";

export function displayBigNumber({
  input,
  isWei,
  nbDecimals,
  isCropped,
}: {
  input: BigNumber | null;
  isWei: number;
  nbDecimals?: number;
  isCropped?: boolean;
}): string {
  if (!input) return "";
  if (!isWei) {
    return input.toString();
  }

  if (isCropped && input.lt(parseEther("0.01"))) {
    return "0.00...";
  }
  return formatToEther({ valueInWei: input, nbDecimals });
}
