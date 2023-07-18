import {
  ClaimType,
  SismoConnectRequest,
} from "../../../services/sismo-connect-provers/sismo-connect-prover-v1";
import { SISMO_CONNECT_COMPATIBLE_VERSIONS } from "../constants";

export enum RequestValidationStatus {
  Error = "error",
  Success = "success",
}

export type RequestValidation = {
  status: RequestValidationStatus;
  message: string;
};

export const validateSismoConnectRequest = (sismoConnectRequest: SismoConnectRequest) => {
  if (
    !sismoConnectRequest.version ||
    !SISMO_CONNECT_COMPATIBLE_VERSIONS.includes(sismoConnectRequest.version)
  ) {
    return {
      status: RequestValidationStatus.Error,
      message: "Invalid version query parameter: " + sismoConnectRequest.version,
    };
  }
  if (!sismoConnectRequest.appId) {
    return {
      status: RequestValidationStatus.Error,
      message: "Invalid appId query parameter: " + sismoConnectRequest.appId,
    };
  }

  if (!sismoConnectRequest?.claims?.length && !sismoConnectRequest?.auths?.length) {
    return {
      status: RequestValidationStatus.Error,
      message: "Invalid request: you must specify at least one claim or one auth",
    };
  }

  if (sismoConnectRequest?.claims) {
    for (const claim of sismoConnectRequest?.claims) {
      if (
        claim?.claimType !== ClaimType.GTE &&
        claim?.claimType !== ClaimType.EQ &&
        typeof claim?.claimType !== "undefined"
      ) {
        return {
          status: RequestValidationStatus.Error,
          message:
            "Invalid claimType: claimType" +
            claim.claimType +
            " will be supported soon. Please use GTE or EQ for now.",
        };
      }
    }
  }

  if (sismoConnectRequest?.devConfig && Boolean(sismoConnectRequest?.claims?.length)) {
    const claimGroupIds = sismoConnectRequest?.claims?.map((claim) => claim?.groupId);
    const devConfigGroupIds = sismoConnectRequest?.devConfig?.devGroups?.map(
      (group) => group?.groupId
    );
    const missingGroups = claimGroupIds?.filter((groupId) => !devConfigGroupIds?.includes(groupId));
    if (missingGroups?.length > 0 && sismoConnectRequest?.devConfig?.devGroups?.length > 0) {
      return {
        status: RequestValidationStatus.Error,
        message:
          "Invalid devConfig: claimRequest groups are not defined in your devConfig. Please add the following groups to your devConfig: " +
          missingGroups.join(", "),
      };
    }
  }

  return {
    status: RequestValidationStatus.Success,
  };
};
