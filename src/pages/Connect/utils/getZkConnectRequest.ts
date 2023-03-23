//import { ZkConnectRequest } from "../../../libs/sismo-client/zk-connect-prover/zk-connect-v1";
import { ZkConnectRequest } from "../localTypes";

export const getZkConnectRequest = (
  searchParams: URLSearchParams
): ZkConnectRequest => {
  let _version = searchParams.get("version");
  let _appId = searchParams.get("appId");
  let _requestContent = searchParams.get("requestContent");
  let _namespace = searchParams.get("namespace");
  let _callbackPath = searchParams.get("callbackPath");

  const request: ZkConnectRequest = {
    namespace: _namespace,
    requestContent: JSON.parse(_requestContent),
    appId: _appId,
    callbackPath: _callbackPath,
    version: _version,
  };

  if (request.requestContent) {
    for (let i = 0; i < request.requestContent.dataRequests.length; i++) {
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
            ? 0
            : request.requestContent.dataRequests[i].claimRequest.claimType;
      }
    }
  }

  request.namespace = request.namespace || "main";
  return request;
};
