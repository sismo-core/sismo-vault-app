import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import env from "../../environment";
import WrongUrlScreen from "./components/WrongUrlScreen";
import PwSFlow from "./PwSFlow";
import axios from "axios";
import * as Sentry from "@sentry/react";

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

export type TargetGroup = {
  groupId: string;
  timestamp?: number | "latest";
  value?: number | "MAX";
  additionalProperties?: any;
};

export type RequestParamsType = {
  version: string;
  appId: string;
  targetGroup: TargetGroup;
  serviceName: string;
  callbackPath: string | null;
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

// const mockGroupMetadata: GroupMetadata = {
//   id: "0x682544d549b8a461d7fe3e589846bb7b",
//   name: "proof-of-humanity",
//   description:
//     "Group of early Sismo supporters holding .sismo.eth ENS, a contribution POAP or early ZK Badges.",
//   specs:
//     "Hold a .sismo.eth Sismo ENS subdomain (Sismo Genesis 0, or X, or A token), or hold a Sismo Contributor Poap (37527: User Testing, or 80235: User Testing#2, or 39515: Artists, or 39651: Community Managers, or 39654: Data Analysts, or 39655: Copywriters, or 39657: Cryptographers, or 39660: Data creators, or 54045: Ziki Run, or 66267: Contributor, or 81377: Contributor#2), or hold a 53325: Meet Sismo @ETHCC POAP, or a 48976: Sismo PreMasquerade POAP, or a 48975: Sismo Masquerade POAP, or hold a early ZK Badge (Masquerade ZK Badge, or Early User ZK Badge, or PoH ZK Badge, or a Ethereum Power User ZK Badge, or a Proof of Attendance ZK Badge, or a ENS Supporter ZK Badge, or a Gitcoin GR15 ZK Badge) or donated to the Sismo Gitcoin Grant 41, or be part of the Sismo Core team",
//   accountsNumber: 6000,
//   groupGeneratorName: "proof-of-humanity",
//   lastGenerationTimestamp: 1676891410,
//   generationFrequency: "weekly",
//   dataUrl:
//     "https://sismo-staging-hub-data.s3.eu-west-1.amazonaws.com/group-snapshot-store/0x682544d549b8a461d7fe3e589846bb7b/1676891410.json",
// };

export const PWS_VERSION = "off-chain-1";

export default function Pws(): JSX.Element {
  const [searchParams] = useSearchParams();
  const [factoryApp, setFactoryApp] = useState<FactoryAppType>(null);
  const [requestParams, setRequestParams] = useState<RequestParamsType>(null);
  const [groupMetadata, setGroupMetadata] = useState<GroupMetadata>(null);
  const [referrerUrl, setReferrerUrl] = useState(null);
  const [referrerName, setReferrerName] = useState("");
  const [callbackUrl, setCallbackUrl] = useState(null);
  const [isWrongUrl, setIsWrongUrl] = useState(null);

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
    let _targetGroup = searchParams.get("targetGroup");
    let _serviceName = searchParams.get("serviceName");
    let _callbackPath = searchParams.get("callbackPath");

    const params = {
      version: _version,
      appId: _appId,
      targetGroup: JSON.parse(_targetGroup),
      serviceName: _serviceName,
      callbackPath: _callbackPath,
    } as RequestParamsType;

    params.targetGroup.timestamp =
      typeof params.targetGroup.timestamp === "undefined"
        ? "latest"
        : params.targetGroup.timestamp;
    params.targetGroup.value =
      typeof params.targetGroup.value === "undefined"
        ? 1
        : params.targetGroup.value;
    if (!params.targetGroup.additionalProperties)
      params.targetGroup.additionalProperties = {};
    params.targetGroup.additionalProperties.acceptHigherValues =
      typeof params.targetGroup.additionalProperties.acceptHigherValues ===
      "undefined"
        ? true
        : params.targetGroup.additionalProperties.acceptHigherValues === "true";
    params.serviceName = params.serviceName || "main";

    if (!_version || !_appId || !_targetGroup || !_serviceName) {
      setIsWrongUrl(true);
      return;
    }
    setRequestParams(params);

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
        setIsWrongUrl(true);
        Sentry.captureException(e);
      }
    }

    async function getGroupMetadata() {
      try {
        const _groupId = params.targetGroup.groupId;
        const _timestamp = params.targetGroup.timestamp;

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
        console.log("TargetGroup error");
        setIsWrongUrl(true);
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
        setIsWrongUrl(true);
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
          <WrongUrlScreen callbackUrl={callbackUrl} />
        ) : (
          <PwSFlow
            factoryApp={factoryApp}
            requestParams={requestParams}
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
