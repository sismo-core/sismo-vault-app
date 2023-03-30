import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import env from "../../environment";
import WrongUrlScreen from "./components/WrongUrlScreen";
import ConnectFlow from "./ConnectFlow";
import * as Sentry from "@sentry/react";
import { ZkConnectRequest } from "./localTypes";
import { FactoryApp } from "../../libs/sismo-client";
import { useSismo } from "../../libs/sismo";
import { getZkConnectRequest } from "./utils/getZkConnectRequest";
import { getReferrer } from "./utils/getReferrerApp";
import {
  RequestGroupMetadata,
  ClaimType,
} from "../../libs/sismo-client/zk-connect-prover/zk-connect-v2";

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

export const PWS_VERSION = "zk-connect-v2";

export default function Connect(): JSX.Element {
  const [searchParams] = useSearchParams();
  const [factoryApp, setFactoryApp] = useState<FactoryApp>(null);
  const [zkConnectRequest, setZkConnectRequest] =
    useState<ZkConnectRequest>(null);
  const [requestGroupsMetadata, setRequestGroupsMetadata] =
    useState<RequestGroupMetadata[]>(null);
  const [hostName, setHostname] = useState<string>(null);
  const [referrerUrl, setReferrerUrl] = useState(null);
  const [callbackUrl, setCallbackUrl] = useState(null);
  const [isWrongUrl, setIsWrongUrl] = useState({
    status: null,
    message: null,
  });

  const { getGroupMetadata, getFactoryApp } = useSismo();

  //Get the request
  useEffect(() => {
    const request = getZkConnectRequest(searchParams);
    setZkConnectRequest(request);
  }, [searchParams]);

  useEffect(() => {
    if (!zkConnectRequest) return;
  }, [zkConnectRequest]);

  //Verify request validity
  useEffect(() => {
    if (!zkConnectRequest) return;
    if (!zkConnectRequest.version || zkConnectRequest.version !== PWS_VERSION) {
      setIsWrongUrl({
        status: true,
        message: "Invalid version query parameter: " + zkConnectRequest.version,
      });
      return;
    }
    if (!zkConnectRequest.appId) {
      setIsWrongUrl({
        status: true,
        message: "Invalid appId query parameter: " + zkConnectRequest.appId,
      });
      return;
    }
    if (!zkConnectRequest.namespace) {
      setIsWrongUrl({
        status: true,
        message:
          "Invalid namespace query parameter: " + zkConnectRequest.namespace,
      });
      return;
    }

    if (zkConnectRequest?.requestContent?.dataRequests) {
      for (const dataRequest of zkConnectRequest?.requestContent
        ?.dataRequests) {
        if (
          dataRequest?.claimRequest?.claimType !== ClaimType.EMPTY &&
          dataRequest?.claimRequest?.claimType !== ClaimType.GTE &&
          dataRequest?.claimRequest?.claimType !== ClaimType.EQ &&
          typeof dataRequest?.claimRequest?.claimType !== "undefined"
        ) {
          setIsWrongUrl({
            status: true,
            message:
              "Invalid claimType: claimType" +
              dataRequest?.claimRequest?.claimType +
              " will be supported soon. Please use GTE or EQ for now.",
          });
          return;
        }
      }
    }

    if (zkConnectRequest?.devConfig) {
      const claimRequests =
        zkConnectRequest?.requestContent?.dataRequests?.filter(
          (dataRequest) =>
            dataRequest?.claimRequest?.claimType !== ClaimType.EMPTY
        );
      const claimGroupIds = claimRequests?.map(
        (claimRequest) => claimRequest?.claimRequest?.groupId
      );
      const devConfigGroupIds = zkConnectRequest?.devConfig?.devGroups?.map(
        (group) => group?.groupId
      );

      const missingGroups = claimGroupIds?.filter(
        (groupId) => !devConfigGroupIds?.includes(groupId)
      );

      if (missingGroups?.length > 0) {
        setIsWrongUrl({
          status: true,
          message:
            "Invalid devConfig: claimRequest groups are not defined in your devConfig. Please add the following groups to your devConfig: " +
            missingGroups.join(", "),
        });
        return;
      }
    }
  }, [zkConnectRequest, factoryApp]);

  //Fetch data
  useEffect(() => {
    if (!zkConnectRequest) return;

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
        //const referrerApp = getReferrerApp(zkConnectRequest);
        //console.log("referrerApp", referrerApp);

        setHostname(_hostname);
        setReferrerUrl(_referrerHostname + _callbackRefererPath);
        setCallbackUrl(
          zkConnectRequest.callbackPath &&
            zkConnectRequest.callbackPath.includes("chrome-extension://")
            ? zkConnectRequest.callbackPath
            : _referrerHostname +
                (zkConnectRequest.callbackPath
                  ? zkConnectRequest.callbackPath
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
      if (
        !zkConnectRequest.requestContent?.dataRequests.some(
          (dataRequest) => dataRequest?.claimRequest?.groupId
        )
      ) {
        setRequestGroupsMetadata(null);
        return;
      }
      try {
        const _claimRequests = [];

        for (const dataRequest of zkConnectRequest?.requestContent
          ?.dataRequests) {
          if (dataRequest?.claimRequest?.groupId) {
            _claimRequests.push(dataRequest.claimRequest);
          }
        }

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
        const factoryApp = await getFactoryApp(zkConnectRequest.appId);
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
            message: `The domain "${_referrerName}" is not an authorized domain for the appId ${zkConnectRequest.appId}. If this is your app, please make sure to add your domain to your zkConnect app from the factory.`,
          });
          return;
        }
        setFactoryApp(factoryApp);
      } catch (e) {
        if (isWrongUrl?.status) return;
        setIsWrongUrl({
          status: true,
          message: "Invalid appId: " + zkConnectRequest.appId,
        });
        Sentry.captureException(e);
        console.error(e);
      }
    }

    setReferrer();
    getGroupMetadataData();
    getFactoryAppData();
  }, [zkConnectRequest, getFactoryApp, getGroupMetadata, isWrongUrl?.status]);

  return (
    <Container>
      <ContentContainer>
        {isWrongUrl?.status ? (
          <WrongUrlScreen callbackUrl={callbackUrl} isWrongUrl={isWrongUrl} />
        ) : (
          <ConnectFlow
            factoryApp={factoryApp}
            zkConnectRequest={zkConnectRequest}
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
