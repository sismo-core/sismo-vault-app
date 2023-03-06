import { Attestation } from "../types";

function isObject(input: object | string | number) {
  return input != null && typeof input === "object";
}

export default function areAttestationsDeepEqual(
  attestation1: Attestation,
  attestation2: Attestation
) {
  const attestation1Keys = Object.keys(attestation1);
  const attestation2Keys = Object.keys(attestation2);

  if (attestation1Keys.length !== attestation2Keys.length) {
    return false;
  }

  for (const key of attestation1Keys) {
    const attestation1Value = attestation1[key];
    const attestation2Value = attestation2[key];

    const areObjects =
      isObject(attestation1Value) && isObject(attestation2Value);

    if (
      (areObjects &&
        !areAttestationsDeepEqual(attestation1Value, attestation2Value)) ||
      (!areObjects && attestation1Value !== attestation2Value)
    ) {
      return false;
    }
  }
  return true;
}
