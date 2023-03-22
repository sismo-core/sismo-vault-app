import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import env from "../../environment";
import WrongUrlScreen from "./components/WrongUrlScreen";
import ConnectFlow from "./ConnectFlow";
import * as Sentry from "@sentry/react";
import { ZkConnectRequest } from "@sismo-core/zk-connect-client";
import { FactoryApp } from "../../libs/sismo-client";
import { useSismo } from "../../libs/sismo";
import { getZkConnectRequest } from "./utils/getZkConnectRequest";
import { getReferrer } from "./utils/getReferrerApp";
import { StatementGroupMetadata } from "../../libs/sismo-client/zk-connect-prover/zk-connect-v1";

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

  /* margin-top: -100px; */
  /* @media (max-width: 1140px) {
    margin-top: -90px;
  }

  @media (max-width: 800px) {
    margin-top: -60px;
  }
  @media (max-width: 600px) {
    margin-top: 80px;
  } */

  box-sizing: border-box;
`;

export type EligibleGroup = {
  [account: string]: number;
};

export const PWS_VERSION = "zk-connect-v1";

export default function Connect(): JSX.Element {
  const [searchParams] = useSearchParams();
  const [factoryApp, setFactoryApp] = useState<FactoryApp>(null);
  const [zkConnectRequest, setZkConnectRequest] =
    useState<ZkConnectRequest>(null);
  const [statementsGroupsMetadata, setStatementsGroupsMetadata] =
    useState<StatementGroupMetadata[]>(null);
  const [hostName, setHostname] = useState<string>(null);
  const [referrerUrl, setReferrerUrl] = useState(null);
  const [callbackUrl, setCallbackUrl] = useState(null);
  const [isWrongUrl, setIsWrongUrl] = useState({
    status: null,
    message: null,
  });

  const { getStatementsGroupsMetadata, getFactoryApp } = useSismo();

  //Get the request
  useEffect(() => {
    const request = getZkConnectRequest(searchParams);
    setZkConnectRequest(request);
  }, [searchParams]);

  //Verify request validity
  useEffect(() => {
    if (!zkConnectRequest) return;
    if (!zkConnectRequest.version) {
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
        console.log("Referrer error");
        setIsWrongUrl({
          status: true,
          message: "Invalid referrer: " + document.referrer,
        });
        Sentry.captureException(e);
      }
    }

    async function getGroupMetadataData() {
      if (!zkConnectRequest.dataRequest) {
        setStatementsGroupsMetadata(null);
        return;
      }
      try {
        const res = await getStatementsGroupsMetadata(zkConnectRequest);
        setStatementsGroupsMetadata(res);
      } catch (e) {
        setIsWrongUrl({
          status: true,
          message: "Invalid Statement request: " + e,
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
          setIsWrongUrl({
            status: true,
            message: `The domain "${_referrerName}" is not an authorized domain for the appId ${zkConnectRequest.appId}. If this is your app, please make sure to add your domain to your zkConnect app from the factory.`,
          });
          return;
        }
        setFactoryApp(factoryApp);
      } catch (e) {
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
  }, [zkConnectRequest, getFactoryApp, getStatementsGroupsMetadata]);

  return (
    <Container>
      <ContentContainer>
        {isWrongUrl?.status ? (
          <WrongUrlScreen callbackUrl={callbackUrl} isWrongUrl={isWrongUrl} />
        ) : (
          <ConnectFlow
            factoryApp={factoryApp}
            zkConnectRequest={zkConnectRequest}
            statementsGroupsMetadata={statementsGroupsMetadata}
            callbackUrl={callbackUrl}
            referrerUrl={referrerUrl}
            hostName={hostName}
          />
        )}
      </ContentContainer>
    </Container>
  );
}
