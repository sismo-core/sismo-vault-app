import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";

export function formatToEther({
  valueInWei,
  nbDecimals,
}: {
  valueInWei: BigNumber;
  nbDecimals?: number;
}): string {
  try {
    const valueInEther = formatEther(valueInWei);
    let formattedValue = valueInEther;
    if (typeof nbDecimals === "number") {
      const valueAsFloat = parseFloat(valueInEther);
      formattedValue = valueAsFloat.toFixed(nbDecimals);
      return Number(formattedValue).toString();
    }
    return formattedValue.toString();
  } catch (error) {
    console.log(error);
  }
}
