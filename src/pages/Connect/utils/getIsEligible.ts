import {
  AuthRequestEligibility,
  ClaimRequestEligibility,
} from "../../../libs/sismo-connect-provers/sismo-connect-prover-v1";

export function getIsEligible(
  claimRequestEligibilities: ClaimRequestEligibility[],
  authRequestEligibilities: AuthRequestEligibility[]
) {
  if (claimRequestEligibilities?.length) {
    for (const claimRequestEligibility of claimRequestEligibilities) {
      let isClaimEligible =
        claimRequestEligibility?.claim?.isOptional === false
          ? claimRequestEligibility?.isEligible
          : true;

      if (!isClaimEligible) {
        return false;
      }
    }
  }

  if (authRequestEligibilities?.length) {
    for (const authRequestEligibility of authRequestEligibilities) {
      let isAuthEligible =
        authRequestEligibility?.auth?.isOptional === false
          ? authRequestEligibility?.isEligible
          : true;

      if (!isAuthEligible) {
        return false;
      }
    }
  }
  return true;
}
