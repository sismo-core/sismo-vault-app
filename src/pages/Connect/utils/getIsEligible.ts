import {
  AuthRequestEligibility,
  ClaimRequestEligibility,
  SismoConnectRequest,
} from "../../../libs/sismo-connect-provers/sismo-connect-prover-v1";

export function getIsEligible(
  claimRequestEligibilities: ClaimRequestEligibility[],
  authRequestEligibilities: AuthRequestEligibility[],
  sismoConnectRequest: SismoConnectRequest
) {
  if (sismoConnectRequest?.claims?.length) {
    if (claimRequestEligibilities?.length) {
      for (const claimRequestEligibility of claimRequestEligibilities) {
        return claimRequestEligibility?.claim?.isOptional === false
          ? claimRequestEligibility?.isEligible
          : true;
      }
    }
    return false;
  }

  if (sismoConnectRequest?.auths?.length) {
    if (authRequestEligibilities?.length) {
      for (const authRequestEligibility of authRequestEligibilities) {
        return authRequestEligibility?.auth?.isOptional === false
          ? authRequestEligibility?.isEligible
          : true;
      }
    }
    return false;
  }

  return true;
}
