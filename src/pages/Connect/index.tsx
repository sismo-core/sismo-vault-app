import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import env from "../../environment";
import WrongUrlScreen from "./components/WrongUrlScreen";
import * as Sentry from "@sentry/react";
import { FactoryApp } from "../../libs/sismo-client";
import { useSismo } from "../../hooks/sismo";
import { getSismoConnectRequest } from "./utils/getSismoConnectRequest";
import { getReferrer } from "./utils/getReferrer";
import {
  RequestGroupMetadata,
  SismoConnectRequest,
  SismoConnectResponse,
} from "../../libs/sismo-connect-provers/sismo-connect-prover-v1";
import { useVault } from "../../hooks/vault";
import { getSismoConnectResponseBytes } from "../../libs/sismo-connect-provers/sismo-connect-prover-v1/utils/getSismoConnectResponseBytes";
import Skeleton from "./components/Skeleton";
import Flow from "./Flow";
import VaultSlider from "./components/VaultSlider";
import Redirection from "./components/Redirection";
import { gzip } from "pako";
import { fromUint8Array } from "js-base64";
import {
  RequestValidationStatus,
  validateSismoConnectRequest,
} from "./utils/validate-sismo-connect-request";

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  width: 100vw;
  padding: 0px 60px;
  margin: 50px 0px;

  @media (max-width: 1140px) {
    min-height: calc(100vh - 90px);
  }
  @media (max-width: 800px) {
    min-height: calc(100vh - 60px);
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
  width: 592px;
  //height: 720px;
  position: relative;
  background: ${(props) => props.theme.colors.blue11};
  border-radius: 10px;
  margin-bottom: 15px;

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

// export type EligibleGroup = {
//   [account: string]: number;
// };
type Props = {
  isImpersonated: boolean;
};

export default function Connect({ isImpersonated }: Props): JSX.Element {
  const [searchParams] = useSearchParams();
  const vault = useVault();
  const [vaultSliderOpen, setVaultSliderOpen] = useState(false);
  const [referrer, setReferrer] = useState<string>(null);

  const [imgLoaded, setImgLoaded] = useState(false);
  const [factoryApp, setFactoryApp] = useState<FactoryApp>(null);

  const [sismoConnectRequest, setSismoConnectRequest] =
    useState<SismoConnectRequest>(null);

  const [requestGroupsMetadata, setRequestGroupsMetadata] =
    useState<RequestGroupMetadata[]>(null);

  const [hostName, setHostname] = useState<string>(null);
  const [callbackUrl, setCallbackUrl] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [isWrongUrl, setIsWrongUrl] = useState({
    status: null,
    message: null,
  });

  const { getGroupMetadata, getFactoryApp, initDevConfig } = useSismo();

  /* ********************************************************** */
  /* ************************ LOAD IMAGE ********************** */
  /* ********************************************************** */

  useEffect(() => {
    const loadImage = (url) => {
      return new Promise((resolve, reject) => {
        const loadImg = new Image(72, 72);
        loadImg.src = url;
        loadImg.onload = () => resolve(url);
        loadImg.onerror = (err) => reject(err);
      });
    };

    if (factoryApp) {
      loadImage(factoryApp.logoUrl).then(() => {
        setTimeout(() => {
          setImgLoaded(true);
        }, 50);
      });
    }
  }, [factoryApp]);

  /* ********************************************************** */
  /* ************ GET THE REQUEST AND SET DEFAULT ************* */
  /* ********************************************************** */

  useEffect(() => {
    const _sismoConnectRequest = getSismoConnectRequest(searchParams);
    if (
      _sismoConnectRequest?.devConfig &&
      _sismoConnectRequest?.devConfig?.enabled !== false &&
      _sismoConnectRequest?.devConfig?.devGroups?.length > 0
    ) {
      initDevConfig(_sismoConnectRequest);
    }
    setSismoConnectRequest(_sismoConnectRequest);
  }, [initDevConfig, searchParams]);

  /* *********************************************************** */
  /* ***************** VERIFY REQUEST VALIDITY ***************** */
  /* *********************************************************** */

  useEffect(() => {
    if (!sismoConnectRequest) return;
    if (isWrongUrl?.status) return;
    const requestValidation = validateSismoConnectRequest(sismoConnectRequest);
    if (requestValidation.status === RequestValidationStatus.Error) {
      setIsWrongUrl({
        status: true,
        message: requestValidation.message,
      });
    }
  }, [sismoConnectRequest, isWrongUrl?.status]);

  useEffect(() => {
    if (!sismoConnectRequest) return;
    if (!referrer) return;
    if (!factoryApp) return;
    if (isWrongUrl?.status) return;

    let _TLD =
      referrer.split(".")?.length > 1
        ? referrer.split(".")[referrer.split(".")?.length - 1].split("/")[0]
        : "";
    let _referrerName =
      referrer.split(".")?.length > 1
        ? referrer.split(".")[referrer.split(".")?.length - 2]
        : referrer.split("/")[2];

    const isAuthorized = factoryApp?.authorizedDomains?.some(
      (domain: string) => {
        if (env.name === "DEV_BETA" && _referrerName.includes("localhost")) {
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
  }, [sismoConnectRequest, factoryApp, isWrongUrl?.status, referrer]);

  /* *********************************************************** */
  /* ***************** GET THE FACTORY APP ********************* */
  /* *********************************************************** */

  useEffect(() => {
    if (!sismoConnectRequest) return;
    async function getFactoryAppData() {
      try {
        const factoryApp = await getFactoryApp(sismoConnectRequest.appId);
        setFactoryApp(factoryApp);
      } catch (e) {
        if (env.name === "DEMO") return;
        if (isWrongUrl?.status) return;
        setIsWrongUrl({
          status: true,
          message: "Invalid appId: " + sismoConnectRequest.appId,
        });
        Sentry.captureException(e);
        console.error(e);
      }
    }
    getFactoryAppData();
  }, [getFactoryApp, isWrongUrl?.status, sismoConnectRequest]);

  /* *********************************************************** */
  /* ***************** GET THE REFERRER ************************ */
  /* *********************************************************** */

  useEffect(() => {
    if (!sismoConnectRequest) return;

    let _hostname = "";
    let _referrerHostname = "";

    function setCallbackUrlQueryParam(callbackUrl: string) {
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set("callbackUrl", callbackUrl);
      window.location.search = urlParams.toString();
    }

    function setReferrerInfo() {
      try {
        let referrer = null;
        if (sismoConnectRequest.callbackUrl) {
          referrer = sismoConnectRequest.callbackUrl;
        } else {
          referrer = getReferrer();
        }
        if (referrer) {
          const referrerUrl = new URL(referrer);
          _referrerHostname =
            referrerUrl.protocol +
            "//" +
            referrerUrl.hostname +
            (referrerUrl.port ? `:${referrerUrl.port}` : "");

          _hostname =
            referrer.split("//").length > 1
              ? referrer.split("//")[1].split("/")[0]
              : "";
        }

        setReferrer(referrer);
        setHostname(_hostname);
        if (sismoConnectRequest.callbackUrl) {
          setCallbackUrl(sismoConnectRequest.callbackUrl);
        } else {
          const callbackUrl =
            sismoConnectRequest.callbackPath &&
            sismoConnectRequest.callbackPath.includes("chrome-extension://")
              ? sismoConnectRequest.callbackPath
              : _referrerHostname +
                (sismoConnectRequest.callbackPath
                  ? sismoConnectRequest.callbackPath
                  : "");
          setCallbackUrlQueryParam(callbackUrl);
          setCallbackUrl(callbackUrl);
        }
      } catch (e) {
        if (isWrongUrl?.status) return;
        setIsWrongUrl({
          status: true,
          message: "Invalid referrer: " + e,
        });
        console.log(e);
        Sentry.captureException(e);
      }
    }
    setReferrerInfo();
  }, [isWrongUrl?.status, sismoConnectRequest]);

  /* *********************************************************** */
  /* ***************** GET THE GROUP METADATA ****************** */
  /* *********************************************************** */

  useEffect(() => {
    if (!sismoConnectRequest) return;

    async function getGroupMetadataData() {
      if (!sismoConnectRequest?.claims?.length) {
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
    getGroupMetadataData();
  }, [getGroupMetadata, isWrongUrl?.status, sismoConnectRequest]);

  /* *********************************************************** */
  /* ***************** ON RESPONSE ***************************** */
  /* *********************************************************** */

  const zipurl = (data) => fromUint8Array(gzip(data), true);

  const onResponse = (response: SismoConnectResponse) => {
    if (!response) return;

    setIsRedirecting(true);
    let url = callbackUrl;
    if (sismoConnectRequest?.compressed) {
      url += `?sismoConnectResponseCompressed=${zipurl(
        JSON.stringify(response)
      )}`;
    }

    if (!sismoConnectRequest?.compressed) {
      url += `?sismoConnectResponse=${JSON.stringify(response)}`;
      if (env.name !== "DEMO") {
        url += `&sismoConnectResponseBytes=${getSismoConnectResponseBytes(
          response
        )}`;
      }
    }

    setTimeout(() => {
      window.location.href = url;
    }, 2000);
  };

  const loading =
    (vault.synchronizing ? true : vault.loadingActiveSession) || !imgLoaded;

  /* *********************************************************** */
  /* ***************** LOADING MEASUREMENTS ******************** */
  /* *********************************************************** */

  useEffect(() => {
    if (vault.loadingActiveSession) console.time("loading session");
    else console.timeEnd("loading session");
  }, [vault.loadingActiveSession]);

  useEffect(() => {
    if (!imgLoaded) console.time("loading image");
    else console.timeEnd("loading image");
  }, [imgLoaded]);

  return (
    <Container>
      {loading && !isWrongUrl?.status && sismoConnectRequest && (
        <ContentContainer>
          <Skeleton sismoConnectRequest={sismoConnectRequest} />
        </ContentContainer>
      )}
      {isWrongUrl?.status && (
        <WrongUrlScreen callbackUrl={callbackUrl} isWrongUrl={isWrongUrl} />
      )}
      {!loading && !isRedirecting && !isWrongUrl?.status && (
        <ContentContainer>
          <VaultSlider
            vaultSliderOpen={vaultSliderOpen}
            setVaultSliderOpen={setVaultSliderOpen}
            isImpersonated={isImpersonated}
          />
          <Flow
            sismoConnectRequest={sismoConnectRequest}
            requestGroupsMetadata={requestGroupsMetadata}
            isImpersonated={isImpersonated}
            factoryApp={factoryApp}
            callbackUrl={callbackUrl}
            hostName={hostName}
            onResponse={onResponse}
          />
        </ContentContainer>
      )}
      {!loading && isRedirecting && !isWrongUrl?.status && (
        <ContentContainer>
          <Redirection />
        </ContentContainer>
      )}
    </Container>
  );
}
