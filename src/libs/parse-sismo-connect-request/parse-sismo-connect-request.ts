import {
  AuthType,
  ClaimType,
  SismoConnectRequest,
} from "../sismo-client/sismo-connect-prover/sismo-connect-v1";
import { v4 as uuidv4 } from "uuid";

export class ParseSismoConnectRequest {
  public get(): SismoConnectRequest | null {
    const sismoConnectRequest = this._parseUrlParams();
    return this._setDefaultValues(sismoConnectRequest);
  }

  private _parseUrlParams() {
    const searchParams = new URLSearchParams(window.location.search);

    if (!searchParams) {
      console.error("No search params found in url");
      return null;
    }

    let _appId = searchParams.get("appId");
    let _namespace = searchParams.get("namespace");
    let _auths = searchParams.get("auths");
    let _claims = searchParams.get("claims");
    let _signature = searchParams.get("signature");
    let _devConfig = searchParams.get("devConfig");
    let _callbackPath = searchParams.get("callbackPath");
    let _callbackUrl = searchParams.get("callbackUrl");
    let _version = searchParams.get("version");
    let _compressed = searchParams.get("compressed");
    let _vault = searchParams.get("vault");

    const request: SismoConnectRequest = {
      appId: _appId,
      namespace: _namespace,
      auths: JSON.parse(_auths),
      claims: JSON.parse(_claims),
      signature: JSON.parse(_signature),
      callbackPath: _callbackPath,
      callbackUrl: _callbackUrl,
      devConfig: JSON.parse(_devConfig),
      vault: JSON.parse(_vault),
      version: _version,
      compressed: _compressed === "true",
    };

    return request;
  }

  private _setDefaultValues(request: SismoConnectRequest) {
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
        auth.uuid = uuidv4();
        auth.authType =
          typeof auth.authType === "undefined" ? AuthType.VAULT : auth.authType;
        auth.isAnon = typeof auth.isAnon === "undefined" ? false : auth.isAnon;
        auth.userId =
          typeof auth.userId === "undefined" || auth.userId === "0"
            ? "0"
            : this._toSismoIdentifier(auth.userId, auth.authType);
        auth.isOptional =
          typeof auth.isOptional === "undefined" ? false : auth.isOptional;
        auth.isSelectableByUser =
          auth.userId === "0"
            ? true
            : typeof auth.isSelectableByUser === "undefined"
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
        claim.uuid = uuidv4();
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
          claim.claimType === ClaimType.EQ
            ? false
            : typeof claim.isSelectableByUser === "undefined"
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
  }

  private _startsWithHexadecimal = (str) => {
    let hexRegex = /^0x[0-9a-fA-F]{6}/;
    return hexRegex.test(str);
  };

  private _toSismoIdentifier = (identifier: string, authType: AuthType) => {
    if (authType === AuthType.EVM_ACCOUNT || authType === AuthType.VAULT)
      return identifier;
    if (this._startsWithHexadecimal(identifier)) return identifier;

    let prefix = null;
    if (authType === AuthType.GITHUB) {
      prefix = "0x1001";
    }
    if (authType === AuthType.TWITTER) {
      prefix = "0x1002";
    }
    identifier = "0".repeat(36 - identifier.length) + identifier;
    identifier = prefix + identifier;
    return identifier;
  };
}
