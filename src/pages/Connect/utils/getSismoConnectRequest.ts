import env from "../../../environment";
import {
  AuthType,
  ClaimType,
  SismoConnectRequest,
} from "../../../libs/sismo-client/sismo-connect-prover/sismo-connect-v1";

export const getSismoConnectRequest = (
  searchParams: URLSearchParams
): SismoConnectRequest => {
  let _appId = searchParams.get("appId");
  let _namespace = searchParams.get("namespace");
  let _auths = searchParams.get("auths");
  let _claims = searchParams.get("claims");
  let _signature = searchParams.get("signature");
  let _devConfig = searchParams.get("devConfig");
  let _callbackPath = searchParams.get("callbackPath");
  let _version = searchParams.get("version");

  const request: SismoConnectRequest = {
    appId: _appId,
    namespace: _namespace,
    auths: JSON.parse(_auths),
    claims: JSON.parse(_claims),
    signature: JSON.parse(_signature),
    callbackPath: _callbackPath,
    devConfig: JSON.parse(_devConfig),
    version: _version,
  };

  /* ****************************************** */
  /* ****** REMOVE ALL URL PARAMS  ************ */
  /* ****************************************** */

  if (env.name !== "DEV_BETA") {
    const url = new URL(window.location.href);
    const deleteParams = [
      "appId",
      "namespace",
      "auths",
      "claims",
      "signature",
      "devConfig",
      "callbackPath",
      "version",
    ];
    deleteParams.forEach((param) => {
      url.searchParams.delete(param);
    });
    window.history.replaceState({}, "", url.toString());
  }

  /* ****************************************** */
  /* * SET DEFAULT NAMESPACE AND VERSION ****** */
  /* ****************************************** */

  request.namespace = request.namespace || "main";
  request.version = request.version || "sismo-connect-v1";

  /* ****************************************** */
  /* ****** SET DEFAULT FOR AUTH  ************* */
  /* ****************************************** */

  if (request.auths) {
    for (const auth of request.auths) {
      auth.authType =
        typeof auth.authType === "undefined" ? AuthType.VAULT : auth.authType;
      auth.isAnon = typeof auth.isAnon === "undefined" ? false : auth.isAnon;
      auth.userId = typeof auth.userId === "undefined" ? "0" : auth.userId;
      auth.isOptional =
        typeof auth.isOptional === "undefined" ? false : auth.isOptional;
      auth.isSelectableByUser =
        typeof auth.isSelectableByUser === "undefined"
          ? false
          : auth.isSelectableByUser;
      auth.extraData =
        typeof auth.extraData === "undefined" ? "" : auth.extraData;
    }
  }

  /* ****************************************** */
  /* ****** SET DEFAULT FOR CLAIM ************* */
  /* ****************************************** */

  if (request.claims) {
    for (const claim of request.claims) {
      claim.claimType =
        typeof claim.claimType === "undefined"
          ? ClaimType.GTE
          : claim.claimType;

      claim.groupTimestamp =
        typeof claim.groupTimestamp === "undefined"
          ? "latest"
          : claim.groupTimestamp;

      claim.value = typeof claim.value === "undefined" ? 1 : claim.value;
      claim.isOptional =
        typeof claim.isOptional === "undefined" ? false : claim.isOptional;
      claim.isSelectableByUser =
        typeof claim.isSelectableByUser === "undefined"
          ? false
          : claim.isSelectableByUser;

      claim.extraData =
        typeof claim.extraData === "undefined" ? "" : claim.extraData;
    }
  }

  /* ****************************************** */
  /* ****** SET DEFAULT FOR SIGNATURE ********* */
  /* ****************************************** */

  if (request.signature) {
    request.signature.isSelectableByUser =
      typeof request.signature.isSelectableByUser === "undefined"
        ? false
        : request.signature.isSelectableByUser;
  }

  /* ****************************************** */
  /* ****** SET DEFAULT FOR DEV CONFIG  ******* */
  /* ****************************************** */

  if (request.devConfig) {
    request.devConfig.displayRawResponse =
      typeof request.devConfig.displayRawResponse === "undefined"
        ? false
        : request.devConfig.displayRawResponse;

    for (let i = 0; i < request.devConfig?.devGroups?.length; i++) {
      request.devConfig.devGroups[i].groupTimestamp =
        typeof request.devConfig.devGroups[i].groupTimestamp === "undefined"
          ? "latest"
          : request.devConfig.devGroups[i].groupTimestamp;
    }
  }

  return request;
};
