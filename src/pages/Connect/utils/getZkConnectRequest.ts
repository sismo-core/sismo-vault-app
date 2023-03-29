import {
  AuthType,
  Claim,
  ClaimType,
  ZkConnectRequest,
  Auth,
} from "../localTypes";

export const getZkConnectRequest = (
  searchParams: URLSearchParams
): ZkConnectRequest => {
  let _version = searchParams.get("version");
  let _appId = searchParams.get("appId");
  let _requestContent = searchParams.get("requestContent");
  let _namespace = searchParams.get("namespace");
  let _callbackPath = searchParams.get("callbackPath");
  let _devConfig = searchParams.get("devConfig");

  // REMOVE ALL URL PARAMS EXCEPT FOR DEV_BETA
  // if (env.name !== "DEV_BETA") {
  //   const url = new URL(window.location.href);
  //   const deleteParams = [
  //     "version",
  //     "appId",
  //     "requestContent",
  //     "namespace",
  //     "callbackPath",
  //   ];
  //   deleteParams.forEach((param) => {
  //     url.searchParams.delete(param);
  //   });
  //   window.history.replaceState({}, "", url.toString());
  // }

  const request: ZkConnectRequest = {
    namespace: _namespace,
    requestContent: JSON.parse(_requestContent),
    appId: _appId,
    callbackPath: _callbackPath,
    version: _version,
    devConfig: JSON.parse(_devConfig),
  };

  if (request.requestContent) {
    if (
      !request?.requestContent?.operators ||
      request?.requestContent?.operators?.length === 0
    ) {
      request.requestContent.operators = ["AND"];
    }

    if (request.devConfig) {
      request.devConfig.modalOutput =
        typeof request.devConfig.modalOutput === "undefined"
          ? null
          : request.devConfig.modalOutput;
    }

    for (let i = 0; i < request.requestContent.dataRequests.length; i++) {
      /* ****************************************** */
      /* ****** SET DEFAULT FOR AUTH  ************* */
      /* ****************************************** */

      if (!request.requestContent.dataRequests[i].authRequest) {
        request.requestContent.dataRequests[i].authRequest = {
          authType: AuthType.EMPTY,
        } as Auth;

        if (request.requestContent.dataRequests[i].authRequest) {
          request.requestContent.dataRequests[i].authRequest.authType =
            typeof request.requestContent.dataRequests[i].authRequest
              .authType === "undefined"
              ? AuthType.ANON
              : request.requestContent.dataRequests[i].authRequest.authType;

          request.requestContent.dataRequests[i].authRequest.anonMode =
            typeof request.requestContent.dataRequests[i].authRequest
              .anonMode === "undefined"
              ? false
              : request.requestContent.dataRequests[i].authRequest.anonMode;

          request.requestContent.dataRequests[i].authRequest.userId =
            typeof request.requestContent.dataRequests[i].authRequest.userId ===
            "undefined"
              ? "0"
              : request.requestContent.dataRequests[i].authRequest.userId;

          request.requestContent.dataRequests[i].authRequest.extraData =
            typeof request.requestContent.dataRequests[i].authRequest
              .extraData === "undefined"
              ? ""
              : request.requestContent.dataRequests[i].authRequest.extraData;
        }

        /* ****************************************** */
        /* ****** SET DEFAULT FOR CLAIM ************* */
        /* ****************************************** */

        if (!request.requestContent.dataRequests[i].claimRequest) {
          request.requestContent.dataRequests[i].claimRequest = {
            claimType: ClaimType.EMPTY,
          } as Claim;
        }

        if (request.requestContent.dataRequests[i].claimRequest) {
          request.requestContent.dataRequests[i].claimRequest.groupTimestamp =
            typeof request.requestContent.dataRequests[i].claimRequest
              .groupTimestamp === "undefined"
              ? "latest"
              : request.requestContent.dataRequests[i].claimRequest
                  .groupTimestamp;

          request.requestContent.dataRequests[i].claimRequest.value =
            typeof request.requestContent.dataRequests[i].claimRequest.value ===
            "undefined"
              ? 1
              : request.requestContent.dataRequests[i].claimRequest.value;

          request.requestContent.dataRequests[i].claimRequest.claimType =
            typeof request.requestContent.dataRequests[i].claimRequest
              .claimType === "undefined"
              ? ClaimType.GTE
              : request.requestContent.dataRequests[i].claimRequest.claimType;

          request.requestContent.dataRequests[i].claimRequest.extraData =
            typeof request.requestContent.dataRequests[i].claimRequest
              .extraData === "undefined"
              ? ""
              : request.requestContent.dataRequests[i].claimRequest.extraData;
        }
      }
    }
  }

  request.namespace = request.namespace || "main";
  return request;
};
