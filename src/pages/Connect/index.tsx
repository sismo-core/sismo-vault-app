import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import env from "../../environment";
import WrongUrlScreen from "./components/WrongUrlScreen";
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
  AuthRequestEligibility,
  GroupMetadataClaimRequestEligibility,
  SelectedSismoConnectRequest,
  SismoConnectResponse,
} from "../../libs/sismo-client/sismo-connect-prover/sismo-connect-v1";
import { useVault } from "../../libs/vault";
import { getSismoConnectResponseBytes } from "../../libs/sismo-client/sismo-connect-prover/sismo-connect-v1/utils/getSismoConnectResponseBytes";
import Skeleton from "./components/Skeleton";
import Flow from "./Flow";
import VaultSlider from "./components/VaultSlider";
import Logo from "./components/Logo";
import Redirection from "./components/Redirection";

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

export default function Connect(): JSX.Element {
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

  const [
    groupMetadataClaimRequestEligibilities,
    setGroupMetadataClaimRequestEligibilities,
  ] = useState<GroupMetadataClaimRequestEligibility[] | null>(null);

  const [authRequestEligibilities, setAuthRequestEligibilities] =
    useState<AuthRequestEligibility[]>(null);

  const [selectedSismoConnectRequest, setSelectedSismoConnectRequest] =
    useState<SelectedSismoConnectRequest | null>(null);

  const [loadingEligible, setLoadingEligible] = useState(true);

  const [hostName, setHostname] = useState<string>(null);
  const [referrerUrl, setReferrerUrl] = useState(null);
  const [callbackUrl, setCallbackUrl] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [isWrongUrl, setIsWrongUrl] = useState({
    status: null,
    message: null,
  });

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
        setImgLoaded(true);
      });
    }
  }, [factoryApp]);

  const {
    getGroupMetadata,
    getFactoryApp,
    initDevConfig,
    getClaimRequestEligibilities,
    getAuthRequestEligibilities,
  } = useSismo();

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

    // Set default values for the selectedSismoConnectRequest
    const selectedSismoConnectRequest: SelectedSismoConnectRequest = {
      ..._sismoConnectRequest,
      selectedAuths: _sismoConnectRequest?.auths?.map((auth) => {
        return {
          ...auth,
          selectedUserId: "",
          isOptIn: auth?.isOptional ? false : true,
        };
      }),
      selectedClaims: _sismoConnectRequest?.claims?.map((claim) => {
        return {
          ...claim,
          selectedValue: null,
          isOptIn: claim?.isOptional ? false : true,
        };
      }),
      selectedSignature: {
        ..._sismoConnectRequest?.signature,
        selectedMessage: _sismoConnectRequest?.signature?.message,
      },
    };

    setSelectedSismoConnectRequest(selectedSismoConnectRequest);
  }, [initDevConfig, searchParams]);

  /* *********************************************************** */
  /* ***************** VERIFY REQUEST VALIDITY ***************** */
  /* *********************************************************** */

  useEffect(() => {
    if (!sismoConnectRequest) return;
    if (isWrongUrl?.status) return;

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
    // if (!sismoConnectRequest.namespace) {
    //   setIsWrongUrl({
    //     status: true,
    //     message:
    //       "Invalid namespace query parameter: " + sismoConnectRequest.namespace,
    //   });
    //   return;
    // }

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

  // TODO: CHECK AUTHORIZED DOMAINS
  useEffect(() => {
    if (!sismoConnectRequest) return;
    async function getFactoryAppData() {
      try {
        const factoryApp = await getFactoryApp(sismoConnectRequest.appId);
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
    getFactoryAppData();
  }, [getFactoryApp, isWrongUrl?.status, sismoConnectRequest]);

  /* *********************************************************** */
  /* ***************** GET THE REFERRER ************************ */
  /* *********************************************************** */

  useEffect(() => {
    if (!sismoConnectRequest) return;

    let _callbackRefererPath = "";
    let _hostname = "";
    let _referrerHostname = "";

    function setReferrerInfo() {
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
          _hostname =
            referrer.split("//").length > 1
              ? referrer.split("//")[1].split("/")[0]
              : "";
        }

        //TODO could be nice to use something like this instead of callbackUrl + hostname + referrerUrl + TDL etc..
        //And in props use ReferrerApp
        //const referrerApp = getReferrerApp(sismoConnectRequest);
        //console.log("referrerApp", referrerApp);
        setReferrer(referrer);
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
  /* ***************** GET ELIGIBILITIES *********************** */
  /* *********************************************************** */

  //TODO : WRONG URL SCREEN ON ELIGIBILITIES ERROR

  useEffect(() => {
    if (!sismoConnectRequest) return;
    //if (!vault.importedAccounts) return;
    if (sismoConnectRequest?.claims?.length && !requestGroupsMetadata) return;

    const getEligibilities = async () => {
      if (
        !sismoConnectRequest?.claims?.length &&
        !sismoConnectRequest?.auths?.length
      ) {
        return;
      }
      try {
        setLoadingEligible(true);

        if (sismoConnectRequest?.auths?.length) {
          const authRequestEligibilities = await getAuthRequestEligibilities(
            sismoConnectRequest,
            vault?.importedAccounts || []
          );
          setAuthRequestEligibilities(authRequestEligibilities);
        }

        if (sismoConnectRequest?.claims?.length) {
          const claimRequestEligibilities = await getClaimRequestEligibilities(
            sismoConnectRequest,
            vault?.importedAccounts || []
          );

          const groupMetadataClaimRequestEligibilities =
            claimRequestEligibilities.map((claimRequestEligibility) => {
              const requestGroupMetadata = requestGroupsMetadata?.find(
                (requestGroupMetadata) =>
                  requestGroupMetadata?.groupMetadata?.id ===
                  claimRequestEligibility?.claim?.groupId
              );

              return {
                ...claimRequestEligibility,
                groupMetadata: requestGroupMetadata?.groupMetadata,
              } as GroupMetadataClaimRequestEligibility;
            });

          setGroupMetadataClaimRequestEligibilities(
            groupMetadataClaimRequestEligibilities
          );
        }
        setLoadingEligible(false);
      } catch (e) {
        if (isWrongUrl?.status) return;
        setIsWrongUrl({
          status: true,
          message: "Invalid request: " + e,
        });
        Sentry.captureException(e);
        setLoadingEligible(false);
      }
    };
    getEligibilities();
  }, [
    getClaimRequestEligibilities,
    getAuthRequestEligibilities,
    requestGroupsMetadata,
    vault?.importedAccounts,
    sismoConnectRequest,
    isWrongUrl?.status,
  ]);

  /* *********************************************************** */
  /* ***************** ON USER INPUT *************************** */
  /* *********************************************************** */

  const onUserInput = (
    selectedSismoConnectRequest: SelectedSismoConnectRequest
  ) => {
    setSelectedSismoConnectRequest(selectedSismoConnectRequest);
  };

  /* *********************************************************** */
  /* ***************** ON RESPONSE ***************************** */
  /* *********************************************************** */

  const onResponse = (response: SismoConnectResponse) => {
    //  localStorage.removeItem("prove_referrer");
    setIsRedirecting(true);
    let url = callbackUrl;
    if (response) {
      url += `?sismoConnectResponse=${JSON.stringify(
        response
      )}&sismoConnectResponseBytes=${getSismoConnectResponseBytes(response)}`;
    }
    setTimeout(() => {
      window.location.href = url;
      //If it's not a popup return the proof in params or url
    }, 2000);
  };

  const loading =
    vault?.loadingActiveSession ||
    (vault?.isConnected
      ? loadingEligible || !imgLoaded || !vault?.importedAccounts
      : loadingEligible || !imgLoaded);

  return (
    <Container>
      {loading && !isWrongUrl?.status && (
        <ContentContainer>
          <Skeleton />
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
          />
          <Flow
            factoryApp={factoryApp}
            selectedSismoConnectRequest={selectedSismoConnectRequest}
            authRequestEligibilities={authRequestEligibilities}
            groupMetadataClaimRequestEligibilities={
              groupMetadataClaimRequestEligibilities
            }
            loadingEligible={loadingEligible}
            callbackUrl={callbackUrl}
            referrerUrl={referrerUrl}
            hostName={hostName}
            onUserInput={onUserInput}
            onResponse={onResponse}
          />
        </ContentContainer>
      )}
      {!loading && isRedirecting && !isWrongUrl?.status && (
        <ContentContainer>
          <Redirection />
        </ContentContainer>
      )}

      <Logo />
    </Container>
  );
}
