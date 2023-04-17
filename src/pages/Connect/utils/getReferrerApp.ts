//import { SismoConnectRequest } from "../../../libs/sismo-client/sismo-connect-prover/sismo-connect-v1";

export type ReferrerApp = {
  referrer: string;
  name: string;
  host: string;
  successCallbackUrl: string;
  errorCallbackUrl: string;
  TLD: string;
};

// export const getReferrerApp = (
//   sismoConnectRequest: SismoConnectRequest
// ): ReferrerApp => {
//   const referrer = getReferrer();
//   const referrerUrl = new URL(referrer);
//   const name =
//     referrer.split(".")?.length > 1
//       ? referrer.split(".")[referrer.split(".")?.length - 2]
//       : referrer.split("/")[2];
//   const host = referrerUrl.host;
//   const successCallbackUrl =
//     sismoConnectRequest.callbackPath &&
//     sismoConnectRequest.callbackPath.includes("chrome-extension://")
//       ? sismoConnectRequest.callbackPath
//       : host +
//         (sismoConnectRequest.callbackPath
//           ? sismoConnectRequest.callbackPath
//           : "");

//   const TLD =
//     referrer.split(".")?.length > 1
//       ? referrer.split(".")[referrer.split(".")?.length - 1].split("/")[0]
//       : "";
//   return {
//     name,
//     host,
//     referrer: referrer,
//     successCallbackUrl,
//     errorCallbackUrl: referrer,
//     TLD,
//   };
// };

export const getReferrer = (): string => {
  const isReferrerSameAsLocation = window?.location?.href?.includes(
    document?.referrer
  );

  if (document?.referrer && !isReferrerSameAsLocation) {
    localStorage.setItem(`sc_referrer`, document?.referrer);
    return document?.referrer;
  }

  if ((document?.referrer && isReferrerSameAsLocation) || !document?.referrer) {
    const referrer = localStorage.getItem(`sc_referrer`);

    if (referrer) {
      return referrer;
    }
    throw new Error("No referrer found");
  }
};
