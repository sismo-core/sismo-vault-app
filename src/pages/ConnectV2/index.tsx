import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import env from "../../environment";
import WrongUrlScreen from "./components/WrongUrlScreen";
//import ConnectFlow from "./ConnectFlow";
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

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 100px);
  width: 100vw;
  padding: 0px 60px;

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
  padding: 40px 24px;
  margin-bottom: 40px;

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

  const [loading, setLoading] = useState(true);

  const [hostName, setHostname] = useState<string>(null);
  const [referrerUrl, setReferrerUrl] = useState(null);
  const [callbackUrl, setCallbackUrl] = useState(null);

  const [isWrongUrl, setIsWrongUrl] = useState({
    status: null,
    message: null,
  });

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
  /* ***************** GET THE FACTORY APP ********************* */
  /* *********************************************************** */

  // TODO: CHECK AUTHORIZED DOMAINS
  // TODO: WRONG URL SCREEN ON FACTORY ERROR
  useEffect(() => {
    if (!sismoConnectRequest) return;
    async function getFactoryAppData() {
      try {
        const factoryApp = await getFactoryApp(sismoConnectRequest.appId);
        setFactoryApp(factoryApp);
      } catch (e) {
        Sentry.captureException(e);
        console.error(e);
      }
    }
    getFactoryAppData();
  }, [getFactoryApp, sismoConnectRequest]);

  /* *********************************************************** */
  /* ***************** GET THE REFERRER ************************ */
  /* *********************************************************** */

  // TODO: WRONG URL SCREEN ON REFERRER ERROR
  useEffect(() => {
    if (!sismoConnectRequest) return;

    let _callbackRefererPath = "";
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
        console.log(e);
        Sentry.captureException(e);
      }
    }
    setReferrer();
  }, [sismoConnectRequest]);

  /* *********************************************************** */
  /* ***************** GET THE GROUP METADATA ****************** */
  /* *********************************************************** */

  //TODO : WRONG URL SCREEN ON GROUP METADATA ERROR

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
        Sentry.captureException(e);
        console.error(e);
      }
    }
    getGroupMetadataData();
  }, [getGroupMetadata, sismoConnectRequest]);

  /* *********************************************************** */
  /* ***************** GET ELIGIBILITIES *********************** */
  /* *********************************************************** */

  //TODO : WRONG URL SCREEN ON ELIGIBILITIES ERROR

  useEffect(() => {
    if (!sismoConnectRequest) return;
    if (!vault.importedAccounts) return;
    if (sismoConnectRequest?.claims?.length && !requestGroupsMetadata) return;

    const getEligibilities = async () => {
      if (
        !sismoConnectRequest?.claims?.length &&
        !sismoConnectRequest?.auths?.length
      ) {
        return;
      }
      try {
        setLoading(true);

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
        setLoading(false);
      } catch (e) {
        Sentry.captureException(e);
        setLoading(false);
      }
    };
    getEligibilities();
  }, [
    getClaimRequestEligibilities,
    getAuthRequestEligibilities,
    requestGroupsMetadata,
    vault?.importedAccounts,
    sismoConnectRequest,
  ]);

  /* *********************************************************** */
  /* ***************** ON RESPONSE ***************************** */
  /* *********************************************************** */

  const onResponse = (response: SismoConnectResponse) => {
    //  localStorage.removeItem("prove_referrer");
    let url = callbackUrl;
    if (response) {
      url += `?sismoConnectResponse=${JSON.stringify(
        response
      )}&sismoConnectResponseBytes=${getSismoConnectResponseBytes(response)}`;
    }
    window.location.href = url; //If it's not a popup return the proof in params or url
  };

  /* *********************************************************** */
  /* ***************** ON USER INPUT *************************** */
  /* *********************************************************** */

  const onUserInput = (
    selectedSismoConnectRequest: SelectedSismoConnectRequest
  ) => {
    setSelectedSismoConnectRequest(selectedSismoConnectRequest);
  };

  return (
    <Container>
      {loading && (
        <ContentContainer>
          <Skeleton />
        </ContentContainer>
      )}
      {/* <div>Wrong Request</div> */}
      {!loading && (
        <ContentContainer>
          <Flow
            factoryApp={factoryApp}
            selectedSismoConnectRequest={selectedSismoConnectRequest}
            authRequestEligibilities={authRequestEligibilities}
            groupMetadataClaimRequestEligibilities={
              groupMetadataClaimRequestEligibilities
            }
            callbackUrl={callbackUrl}
            referrerUrl={referrerUrl}
            hostName={hostName}
            onUserInput={onUserInput}
          />
        </ContentContainer>
      )}

      {/* <ContentContainer>
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
      </ContentContainer> */}
    </Container>
  );
}
