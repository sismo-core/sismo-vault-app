import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import env from "../../environment";
import WrongUrlScreen from "./components/WrongUrlScreen";
import ConnectFlow from "./ConnectFlow";
import * as Sentry from "@sentry/react";
import { FactoryApp } from "../../libs/sismo-client";
import { useSismo } from "../../libs/sismo";
import { getSismoConnectRequest } from "./utils/getSismoConnectRequest";
import { getReferrer } from "./utils/getReferrerApp";
import {
  RequestGroupMetadata,
  SismoConnectRequest,
  SISMO_CONNECT_VERSION,
  ClaimType,
} from "../../libs/sismo-client/sismo-connect-prover/sismo-connect-v1";

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 100px);
  width: 100vw;
  padding: 0px 60px;

  @media (max-width: 1140px) {
    height: calc(100vh - 90px);
  }
  @media (max-width: 800px) {
    height: calc(100vh - 60px);
    padding: 0px 30px;
  }
  @media (max-width: 600px) {
    padding: 0px 10px;
  }
  box-sizing: border-box;
`;

const ContentContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  gap: 10px;
  width: 530px;
  height: 720px;
  position: relative;

  @media (max-width: 900px) {
    width: 100%;
    margin-top: -60px;
  }

  /* margin-top: -100px; */
  /* @media (max-width: 1140px) {
    margin-top: -90px;
  }
  @media (max-width: 600px) {
    margin-top: 80px;
  } */

  box-sizing: border-box;
`;

export type EligibleGroup = {
  [account: string]: number;
};

export default function Connect(): JSX.Element {
  const [searchParams] = useSearchParams();
  const [factoryApp, setFactoryApp] = useState<FactoryApp>(null);
  const [sismoConnectRequest, setSismoConnectRequest] =
    useState<SismoConnectRequest>(null);
  const [requestGroupsMetadata, setRequestGroupsMetadata] =
    useState<RequestGroupMetadata[]>(null);
  const [hostName, setHostname] = useState<string>(null);
  const [referrerUrl, setReferrerUrl] = useState(null);
  const [callbackUrl, setCallbackUrl] = useState(null);
  const [isWrongUrl, setIsWrongUrl] = useState({
    status: null,
    message: null,
  });

  const { getGroupMetadata, getFactoryApp, initDevConfig } = useSismo();

  //Get the request
  useEffect(() => {
    const request = getSismoConnectRequest(searchParams);
    if (
      request?.devConfig &&
      request?.devConfig?.enabled !== false &&
      request?.devConfig?.devGroups?.length > 0
    ) {
      initDevConfig(request);
    }
    setSismoConnectRequest(request);
  }, [initDevConfig, searchParams]);

  //Verify request validity
  useEffect(() => {
    if (!sismoConnectRequest) return;
    if (
      !sismoConnectRequest.version ||
      sismoConnectRequest.version !== SISMO_CONNECT_VERSION
    ) {
      setIsWrongUrl({
        status: true,
        message:
          "Invalid version query parameter: " + sismoConnectRequest.version,
      });
      return;
    }
    if (!sismoConnectRequest.appId) {
      setIsWrongUrl({
        status: true,
        message: "Invalid appId query parameter: " + sismoConnectRequest.appId,
      });
      return;
    }
    if (!sismoConnectRequest.namespace) {
      setIsWrongUrl({
        status: true,
        message:
          "Invalid namespace query parameter: " + sismoConnectRequest.namespace,
      });
      return;
    }

    if (sismoConnectRequest?.claims) {
      for (const claim of sismoConnectRequest?.claims) {
        if (
          claim?.claimType !== ClaimType.GTE &&
          claim?.claimType !== ClaimType.EQ &&
          typeof claim?.claimType !== "undefined"
        ) {
          setIsWrongUrl({
            status: true,
            message:
              "Invalid claimType: claimType" +
              claim.claimType +
              " will be supported soon. Please use GTE or EQ for now.",
          });
          return;
        }
      }
    }

    if (
      sismoConnectRequest?.devConfig &&
      Boolean(sismoConnectRequest?.claims?.length)
    ) {
      const claimGroupIds = sismoConnectRequest?.claims?.map(
        (claim) => claim?.groupId
      );
      const devConfigGroupIds = sismoConnectRequest?.devConfig?.devGroups?.map(
        (group) => group?.groupId
      );
      const missingGroups = claimGroupIds?.filter(
        (groupId) => !devConfigGroupIds?.includes(groupId)
      );
      if (
        missingGroups?.length > 0 &&
        sismoConnectRequest?.devConfig?.devGroups?.length > 0
      ) {
        setIsWrongUrl({
          status: true,
          message:
            "Invalid devConfig: claimRequest groups are not defined in your devConfig. Please add the following groups to your devConfig: " +
            missingGroups.join(", "),
        });
        return;
      }
    }
  }, [sismoConnectRequest, factoryApp]);

  //Fetch data
  useEffect(() => {
    if (!sismoConnectRequest) return;

    let _referrerName = "your app";
    let _callbackRefererPath = "";
    let _TLD = "";
    let _hostname = "";
    let _referrerHostname = "";

    function setReferrer() {
      try {
        const referrer = getReferrer();
        if (referrer) {
          const referrerUrl = new URL(referrer);
          _referrerHostname =
            referrerUrl.protocol +
            "//" +
            referrerUrl.hostname +
            (referrerUrl.port ? `:${referrerUrl.port}` : "");

          _callbackRefererPath = referrerUrl.pathname;

          _TLD =
            referrer.split(".")?.length > 1
              ? referrer
                  .split(".")
                  [referrer.split(".")?.length - 1].split("/")[0]
              : "";
          _referrerName =
            referrer.split(".")?.length > 1
              ? referrer.split(".")[referrer.split(".")?.length - 2]
              : referrer.split("/")[2];
          _hostname =
            referrer.split("//").length > 1
              ? referrer.split("//")[1].split("/")[0]
              : "";
        }

        //TODO could be nice to use something like this instead of callbackUrl + hostname + referrerUrl + TDL etc..
        //And in props use ReferrerApp
        //const referrerApp = getReferrerApp(sismoConnectRequest);
        //console.log("referrerApp", referrerApp);

        setHostname(_hostname);
        setReferrerUrl(_referrerHostname + _callbackRefererPath);
        setCallbackUrl(
          sismoConnectRequest.callbackPath &&
            sismoConnectRequest.callbackPath.includes("chrome-extension://")
            ? sismoConnectRequest.callbackPath
            : _referrerHostname +
                (sismoConnectRequest.callbackPath
                  ? sismoConnectRequest.callbackPath
                  : "")
        );
      } catch (e) {
        if (isWrongUrl?.status) return;
        setIsWrongUrl({
          status: true,
          message: "Invalid referrer: " + document.referrer,
        });
        Sentry.captureException(e);
      }
    }

    async function getGroupMetadataData() {
      if (!sismoConnectRequest?.claims.length) {
        setRequestGroupsMetadata(null);
        return;
      }
      try {
        const _claimRequests = sismoConnectRequest?.claims;

        const res = await Promise.all(
          _claimRequests.map((_claimRequest) => {
            return getGroupMetadata(
              _claimRequest?.groupId,
              _claimRequest?.groupTimestamp
            );
          })
        );

        const requestGroupsMetadata = _claimRequests.map(
          (_claimRequest, index) => {
            return {
              claim: _claimRequest,
              groupMetadata: res[index],
            };
          }
        );

        setRequestGroupsMetadata(requestGroupsMetadata);
      } catch (e) {
        if (isWrongUrl?.status) return;
        setIsWrongUrl({
          status: true,
          message: "Invalid Claim requests: " + e,
        });
        Sentry.captureException(e);
        console.error(e);
      }
    }

    async function getFactoryAppData() {
      try {
        const factoryApp = await getFactoryApp(sismoConnectRequest.appId);
        //TODO move this in the validate useEffect
        const isAuthorized = factoryApp.authorizedDomains.some(
          (domain: string) => {
            if (
              env.name === "DEV_BETA" &&
              _referrerName.includes("localhost")
            ) {
              return true;
            }
            if (
              domain.includes("localhost") &&
              _referrerName.includes("localhost")
            ) {
              return true;
            }
            const domainName = domain.split(".")[domain.split(".").length - 2];
            const TLD = domain.split(".")[domain.split(".").length - 1];
            if (domainName === "*") return true;
            if (domainName === _referrerName && TLD === _TLD) return true;
            return false;
          }
        );

        if (!isAuthorized) {
          if (isWrongUrl?.status) return;
          setIsWrongUrl({
            status: true,
            message: `The domain "${_referrerName}" is not an authorized domain for the appId ${sismoConnectRequest.appId}. If this is your app, please make sure to add your domain to your sismoConnect app from the factory.`,
          });
          return;
        }
        setFactoryApp(factoryApp);
      } catch (e) {
        if (isWrongUrl?.status) return;
        setIsWrongUrl({
          status: true,
          message: "Invalid appId: " + sismoConnectRequest.appId,
        });
        Sentry.captureException(e);
        console.error(e);
      }
    }

    setReferrer();
    getGroupMetadataData();
    getFactoryAppData();
  }, [
    sismoConnectRequest,
    getFactoryApp,
    getGroupMetadata,
    isWrongUrl?.status,
  ]);

  return (
    <Container>
      <ContentContainer>
        {isWrongUrl?.status ? (
          <WrongUrlScreen callbackUrl={callbackUrl} isWrongUrl={isWrongUrl} />
        ) : (
          <ConnectFlow
            factoryApp={factoryApp}
            sismoConnectRequest={sismoConnectRequest}
            requestGroupsMetadata={requestGroupsMetadata}
            callbackUrl={callbackUrl}
            referrerUrl={referrerUrl}
            hostName={hostName}
          />
        )}
      </ContentContainer>
    </Container>
  );
}
