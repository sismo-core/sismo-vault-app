import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import env from "../../environment";
import WrongUrlScreen from "./components/WrongUrlScreen";
import ConnectFlow from "./ConnectFlow";
import axios from "axios";
import * as Sentry from "@sentry/react";
import { ZkConnectRequest } from "../../libs/zk-connect/types";

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

export type FactoryAppType = {
  creatorId: string;
  name: string;
  description: string;
  authorizedDomains: string[];
  logoUrl: string; // png url
  id: string;
  createdAt: number;
  lastUpdatedAt: number;
};

export type EligibleGroup = {
  [account: string]: number;
};

export type GroupMetadata = {
  id: string;
  name: string;
  description: string;
  specs: string;
  accountsNumber: number;
  groupGeneratorName: string;
  lastGenerationTimestamp: number;
  generationFrequency: string;
  dataUrl: string;
};

export const PWS_VERSION = "off-chain-1";

export default function Connect(): JSX.Element {
  const [searchParams] = useSearchParams();
  const [factoryApp, setFactoryApp] = useState<FactoryAppType>(null);
  const [zkConnectRequest, setZkConnectRequest] =
    useState<ZkConnectRequest>(null);
  const [groupMetadata, setGroupMetadata] = useState<GroupMetadata>(null);
  const [hasDataRequested, setIsDataRequest] = useState<boolean | null>(null);
  const [referrerUrl, setReferrerUrl] = useState(null);
  const [referrerName, setReferrerName] = useState("");
  const [callbackUrl, setCallbackUrl] = useState(null);
  const [isWrongUrl, setIsWrongUrl] = useState({
    status: null,
    message: null,
  });

  const getReferrer = (): string => {
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

  useEffect(() => {
    let _version = searchParams.get("version");
    let _appId = searchParams.get("appId");
    let _dataRequest = searchParams.get("dataRequest");
    let _namespace = searchParams.get("namespace");
    let _callbackPath = searchParams.get("callbackPath");

    const params = {
      version: _version,
      appId: _appId,
      dataRequest: JSON.parse(_dataRequest),
      namespace: _namespace,
      callbackPath: _callbackPath,
    } as ZkConnectRequest;

    if (!params.dataRequest) {
      setIsDataRequest(false);
    }

    if (params.dataRequest) {
      setIsDataRequest(true);
      params.dataRequest.statementRequests[0].groupTimestamp =
        typeof params.dataRequest.statementRequests[0].groupTimestamp ===
        "undefined"
          ? "latest"
          : params.dataRequest.statementRequests[0].groupTimestamp;
      params.dataRequest.statementRequests[0].requestedValue =
        typeof params.dataRequest.statementRequests[0].requestedValue ===
        "undefined"
          ? 1
          : params.dataRequest.statementRequests[0].requestedValue;

      params.dataRequest.statementRequests[0].comparator =
        typeof params.dataRequest.statementRequests[0].comparator ===
        "undefined"
          ? "GTE"
          : params.dataRequest.statementRequests[0].comparator;
    }

    params.namespace = params.namespace || "main";

    if (!_version) {
      setIsWrongUrl({
        status: true,
        message: "Invalid version query parameter: " + _version,
      });
      return;
    }
    if (!_appId) {
      setIsWrongUrl({
        status: true,
        message: "Invalid appId query parameter: " + _appId,
      });
      return;
    }
    if (!params.namespace) {
      setIsWrongUrl({
        status: true,
        message: "Invalid namespace query parameter: " + params.namespace,
      });
      return;
    }

    setZkConnectRequest(params);

    let _callbackUrl = "http://myfakeapp.com";
    let _referrerName = "your app";
    let _callbackRefererPath = "";
    let _TLD = "";

    function setReferrer() {
      try {
        const referrer = getReferrer();
        if (referrer) {
          console.log("referrer", referrer);
          const referrerUrl = new URL(referrer);
          _callbackUrl =
            referrerUrl.protocol +
            "//" +
            referrerUrl.hostname +
            (referrerUrl.port ? `:${referrerUrl.port}` : "");
          _callbackRefererPath = referrerUrl.pathname;
          _referrerName =
            referrer.split(".")?.length > 1
              ? referrer.split(".")[referrer.split(".")?.length - 2]
              : referrer.split("/")[2];
          _TLD =
            referrer.split(".")?.length > 1
              ? referrer
                  .split(".")
                  [referrer.split(".")?.length - 1].split("/")[0]
              : "";
        }
        setReferrerName(_referrerName);
        setReferrerUrl(_callbackUrl + _callbackRefererPath);
        setCallbackUrl(_callbackUrl + (_callbackPath ? _callbackPath : ""));
      } catch (e) {
        console.log("Referrer error");
        setIsWrongUrl({
          status: true,
          message: "Invalid referrer: " + document.referrer,
        });
        Sentry.captureException(e);
      }
    }

    async function getGroupMetadata() {
      if (!params.dataRequest) {
        setGroupMetadata(null);
        return;
      }
      try {
        const _groupId = params.dataRequest.statementRequests[0].groupId;
        const _timestamp =
          params.dataRequest.statementRequests[0].groupTimestamp;

        const groupsSnapshotMetadata = await axios.get(
          `${env.hubApiUrl}/group-snapshots/${_groupId}?timestamp=${_timestamp}`
        );
        const groupsQueryUrlAppendix =
          _timestamp === "latest" ? `?latest=true` : `?timestamp=${_timestamp}`;
        const groups = await axios.get(
          `${env.hubApiUrl}/groups/${groupsSnapshotMetadata.data.items[0].name}?${groupsQueryUrlAppendix}`
        );
        const groupsGenerator = await axios.get(
          `${env.hubApiUrl}/group-generators/${groups.data.items[0].generatedBy}?latest=true`
        );

        const _groupMetadata = {
          id: groups.data.items[0].id,
          name: groups.data.items[0].name,
          description: groups.data.items[0].description,
          specs: groups.data.items[0].specs,
          accountsNumber:
            groupsSnapshotMetadata.data.items[0].properties.accountsNumber,
          groupGeneratorName: groups.data.items[0].generatedBy,
          lastGenerationTimestamp:
            groupsSnapshotMetadata.data.items[0].timestamp,
          generationFrequency:
            groupsGenerator.data.items[0].generationFrequency,
          dataUrl: groupsSnapshotMetadata.data.items[0].dataUrl,
        };

        setGroupMetadata(_groupMetadata);
      } catch (e) {
        setIsWrongUrl({
          status: true,
          message: "Invalid Statement request: " + e,
        });
        Sentry.captureException(e);
        console.error(e);
      }
    }

    async function getFactoryApp() {
      try {
        const factoryApp = await axios.get(
          `${env.factoryApiUrl}/apps/${_appId}`
        );

        const isAuthorized = factoryApp.data.authorizedDomains.some(
          (domain: string) => {
            const domainName = domain.split(".")[domain.split(".").length - 2];
            const TLD = domain.split(".")[domain.split(".").length - 1];
            console.log(
              "domain;",
              domainName,
              "referrer:",
              _referrerName,
              "authTld:",
              TLD,
              "refTLD:",
              _TLD
            );
            if (domainName === "*") return true;
            if (domainName === _referrerName && TLD === _TLD) return true;
            return false;
          }
        );

        if (!isAuthorized) {
          throw new Error("Unauthorized domain");
        }

        setFactoryApp(factoryApp.data);
      } catch (e) {
        console.log("Factory app error");
        setIsWrongUrl({
          status: true,
          message: "Invalid appId: " + _appId,
        });
        Sentry.captureException(e);
        console.error(e);
      }
    }

    setReferrer();
    getGroupMetadata();
    getFactoryApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <Container>
      <ContentContainer>
        {isWrongUrl ? (
          <WrongUrlScreen callbackUrl={callbackUrl} isWrongUrl={isWrongUrl} />
        ) : (
          <ConnectFlow
            factoryApp={factoryApp}
            hasDataRequested={hasDataRequested}
            zkConnectRequest={zkConnectRequest}
            groupMetadata={groupMetadata}
            callbackUrl={callbackUrl}
            referrerUrl={referrerUrl}
            referrerName={referrerName}
          />
        )}
      </ContentContainer>
    </Container>
  );
}
