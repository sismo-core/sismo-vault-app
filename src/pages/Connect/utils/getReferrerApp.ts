import { ZkConnectRequest } from "../../../libs/sismo-client/zk-connect-prover/zk-connect-v1";

export type ReferrerApp = {
  referrer: string;
  name: string;
  host: string;
  successCallbackUrl: string;
  errorCallbackUrl: string;
  TLD: string;
};

export const getReferrerApp = (
  zkConnectRequest: ZkConnectRequest
): ReferrerApp => {
  const referrer = getReferrer();
  const referrerUrl = new URL(referrer);
  const name =
    referrer.split(".")?.length > 1
      ? referrer.split(".")[referrer.split(".")?.length - 2]
      : referrer.split("/")[2];
  const host = referrerUrl.host;
  const successCallbackUrl =
    zkConnectRequest.callbackPath &&
    zkConnectRequest.callbackPath.includes("chrome-extension://")
      ? zkConnectRequest.callbackPath
      : host +
        (zkConnectRequest.callbackPath ? zkConnectRequest.callbackPath : "");

  const TLD =
    referrer.split(".")?.length > 1
      ? referrer.split(".")[referrer.split(".")?.length - 1].split("/")[0]
      : "";
  return {
    name,
    host,
    referrer: referrer,
    successCallbackUrl,
    errorCallbackUrl: referrer,
    TLD,
  };
};

export const getReferrer = (): string => {
  if (!document?.referrer) {
    const referrer = localStorage.getItem("pws_referrer");
    if (referrer) {
      return referrer;
    }
    return null;
  }
  if (document?.referrer) {
    localStorage.setItem("pws_referrer", document.referrer);
    return document.referrer;
  }
};
