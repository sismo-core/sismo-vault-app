import {
  AuthRequestEligibility,
  GroupMetadataClaimRequestEligibility,
} from "../../../libs/sismo-client/sismo-connect-prover/sismo-connect-v1";

export function getIsEligible(
  groupMetadataClaimRequestEligibilities: GroupMetadataClaimRequestEligibility[],
  authRequestEligibilities: AuthRequestEligibility[]
) {
  if (groupMetadataClaimRequestEligibilities?.length) {
    for (const groupMetadataClaimRequestEligibility of groupMetadataClaimRequestEligibilities) {
      let isClaimEligible =
        groupMetadataClaimRequestEligibility?.claim?.isOptional === false
          ? groupMetadataClaimRequestEligibility?.isEligible
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
