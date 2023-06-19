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
  if (sismoConnectRequest?.auths?.length) {
    const isEligible = authRequestEligibilities?.every(
      (authRequestEligibility) =>
        authRequestEligibility?.auth?.isOptional
          ? true
          : authRequestEligibility?.isEligible
    );
    if (!isEligible) return false;
  }

  if (sismoConnectRequest?.claims?.length) {
    const isEligible = claimRequestEligibilities?.every(
      (claimRequestEligibility) =>
        claimRequestEligibility?.claim?.isOptional
          ? true
          : claimRequestEligibility?.isEligible
    );
    if (!isEligible) return false;
  }

  return true;
}
