import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";

export function formatToEther(valueInWei: BigNumber) {
  try {
    const valueInEther = formatEther(valueInWei);
    const valueAsFloat = parseFloat(valueInEther);
    const formattedValue = valueAsFloat;
    const result = Number(formattedValue).toString();
    return result;
  } catch (error) {
    console.log(error);
  }
}
