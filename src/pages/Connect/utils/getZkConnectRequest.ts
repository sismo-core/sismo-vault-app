import { ZkConnectRequest } from "../../../libs/sismo-client/zk-connect-prover/zk-connect-v1";

export const getZkConnectRequest = (
  searchParams: URLSearchParams
): ZkConnectRequest => {
  let _version = searchParams.get("version");
  let _appId = searchParams.get("appId");
  let _dataRequest = searchParams.get("dataRequest");
  let _namespace = searchParams.get("namespace");
  let _callbackPath = searchParams.get("callbackPath");

  const request: ZkConnectRequest = {
    version: _version,
    appId: _appId,
    dataRequest: JSON.parse(_dataRequest),
    namespace: _namespace,
    callbackPath: _callbackPath,
  };

  if (request.dataRequest) {
    for (let i = 0; i < request.dataRequest.statementRequests.length; i++) {
      request.dataRequest.statementRequests[i].groupTimestamp =
        typeof request.dataRequest.statementRequests[i].groupTimestamp ===
        "undefined"
          ? "latest"
          : request.dataRequest.statementRequests[i].groupTimestamp;
      request.dataRequest.statementRequests[i].requestedValue =
        typeof request.dataRequest.statementRequests[i].requestedValue ===
        "undefined"
          ? 1
          : request.dataRequest.statementRequests[i].requestedValue;

      request.dataRequest.statementRequests[i].comparator =
        typeof request.dataRequest.statementRequests[i].comparator ===
        "undefined"
          ? "GTE"
          : request.dataRequest.statementRequests[i].comparator;
    }
  }

  request.namespace = request.namespace || "main";
  return request;
};
