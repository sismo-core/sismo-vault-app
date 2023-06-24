import { BigNumber } from "ethers";
import { formatToEther } from "./formatToEther";

export function displayBigNumber(
  input: BigNumber | null,
  decimals: number
): string {
  if (!input) return "";
  if (!decimals) {
    return input.toString();
  }
  if (input.eq(BigNumber.from(1))) {
    return "1e-18";
  }
  return formatToEther(input);
}
