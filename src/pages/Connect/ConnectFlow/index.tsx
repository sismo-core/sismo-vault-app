import { useState, useEffect } from "react";
import styled from "styled-components";
import SignIn from "./steps/0_SignIn";
import ImportEligibleAccount from "./steps/1_ImportEligibleAccount";
import GenerateZkProof from "./steps/2_GenerateZkProof";
import LayoutFlow from "./components/LayoutFlow";
import { useVault } from "../../../libs/vault";
import { useSismo } from "../../../libs/sismo";
import * as Sentry from "@sentry/react";
import { ArrowLeft } from "phosphor-react";
import env from "../../../environment";
import { FactoryApp } from "../../../libs/sismo-client";

import { getSismoConnectResponseBytes } from "../../../libs/sismo-client/sismo-connect-prover/sismo-connect-v1/utils/getSismoConnectResponseBytes";
import {
  AuthRequestEligibility,
  GroupMetadataClaimRequestEligibility,
  RequestGroupMetadata,
  SismoConnectRequest,
  SismoConnectResponse,
  SelectedSismoConnectRequest,
  SelectedAuthRequest,
} from "../../../libs/sismo-client/sismo-connect-prover/sismo-connect-v1";

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
`;

const GoBack = styled.div`
  position: absolute;
  top: -41px;
  right: 550px;
  cursor: pointer;
  font-size: 14px;
  color: ${(props) => props.theme.colors.blue0};
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
`;

export type Step =
  | "SignIn"
  | "ImportEligibleAccount"
  | "GenerateZkProof"
  | "Redirecting";

type Props = {
  factoryApp: FactoryApp;
  sismoConnectRequest: SismoConnectRequest;
  requestGroupsMetadata: RequestGroupMetadata[];
  callbackUrl: string;
  referrerUrl: string;
  hostName: string;
};

export default function ConnectFlow({
  factoryApp,
  sismoConnectRequest,
  requestGroupsMetadata,
  referrerUrl,
  callbackUrl,
  hostName,
}: Props): JSX.Element {
  const vault = useVault();
  const [vaultSliderOpen, setVaultSliderOpen] = useState(false);

  const [
    groupMetadataClaimRequestEligibilities,
    setGroupMetadataClaimRequestEligibilities,
  ] = useState<GroupMetadataClaimRequestEligibility[] | null>(null);

  const [authRequestEligibilities, setAuthRequestEligibilities] =
    useState<AuthRequestEligibility[]>(null);

  const [selectedSismoConnectRequest, setSelectedSismoConnectRequest] =
    useState<SelectedSismoConnectRequest | null>(null);

  const [step, setStep] = useState<Step>("SignIn");
  const [loadingEligible, setLoadingEligible] = useState(true);
  const { getClaimRequestEligibilities, getAuthRequestEligibilities } =
    useSismo();

  /* *************************************************** */
  /* ************** SET INITIAL USER SELECT ************ */
  /* *************************************************** */

  useEffect(() => {
    if (!sismoConnectRequest) return;

    const selectedSismoConnectRequest: SelectedSismoConnectRequest = {
      ...sismoConnectRequest,
      selectedAuths: sismoConnectRequest?.auths?.map((auth) => {
        return {
          ...auth,
          selectedUserId: auth?.userId,
          isOptIn: true,
        };
      }),
      selectedClaims: sismoConnectRequest?.claims?.map((claim) => {
        return {
          ...claim,
          selectedValue: claim.value,
          isOptIn: true,
        };
      }),
      selectedSignature: {
        ...sismoConnectRequest?.signature,
        selectedMessage: sismoConnectRequest?.signature?.message,
      },
    };
    setSelectedSismoConnectRequest(selectedSismoConnectRequest);
  }, [sismoConnectRequest]);

  const onUserInput = (
    selectedSismoConnectRequest: SelectedSismoConnectRequest
  ) => {
    console.log("onUserInput", selectedSismoConnectRequest);
    setSelectedSismoConnectRequest(selectedSismoConnectRequest);
  };

  /* *************************************************** */
  /* **************** TEST ELIGIBILITY ***************** */
  /* *************************************************** */

  useEffect(() => {
    if (!sismoConnectRequest) return;

    const testEligibility = async () => {
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
        Sentry.captureException(e);
        setLoadingEligible(false);
        console.log("ERROR", e);
      }
    };
    testEligibility();
  }, [
    getClaimRequestEligibilities,
    getAuthRequestEligibilities,
    requestGroupsMetadata,
    vault.importedAccounts,
    sismoConnectRequest,
  ]);

  /* *************************************************** */
  /* ******************** REDIRECT ********************* */
  /* *************************************************** */

  const redirect = (response: SismoConnectResponse) => {
    localStorage.removeItem("prove_referrer");
    let url = callbackUrl;
    if (response) {
      url += `?sismoConnectResponse=${JSON.stringify(
        response
      )}&sismoConnectResponseBytes=${getSismoConnectResponseBytes(response)}`;
    }
    if (window.opener) {
      window.opener.postMessage(response, url); //If it's a popup, this will send a message to the opener which is here zkdrop.io
      window.close(); //Close the popup
    } else {
      window.location.href = url; //If it's not a popup return the proof in params or url
    }
  };

  /* *************************************************** */
  /* *********** SIGN OUT REDIRECT ********************* */
  /* *************************************************** */

  useEffect(() => {
    if (!vault.isConnected) {
      setStep("SignIn");
    }
  }, [vault.isConnected]);

  /* *************************************************** */
  /* ********************* DEMO ************************ */
  /* *************************************************** */
  //  Auto open vault slider when in demo mode

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (env.name === "DEMO" && step === "ImportEligibleAccount") {
      timeout = setTimeout(() => {
        setVaultSliderOpen(true);
      }, 150);
    }

    if (
      env.name === "DEMO" &&
      step === "GenerateZkProof" &&
      !requestGroupsMetadata
    ) {
      timeout = setTimeout(() => {
        setVaultSliderOpen(true);
      }, 150);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [requestGroupsMetadata, step]);

  useEffect(() => {
    if (!vault.isConnected) return;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const _code = urlParams.get("code");
    const _oauthToken = urlParams.get("oauth_token");
    if (_oauthToken || _code) {
      setStep("ImportEligibleAccount");
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goBack = () => {
    if (window.opener) {
      window.opener.postMessage(null, callbackUrl);
      window.close();
    } else {
      window.location.href = callbackUrl;
    }
  };

  return (
    <>
      <Container>
        {hostName && (
          <GoBack onClick={() => goBack()}>
            <ArrowLeft style={{ marginRight: 15 }} />
            Go back to {hostName}
          </GoBack>
        )}
        {step === "SignIn" && (
          <SignIn
            factoryApp={factoryApp}
            sismoConnectRequest={sismoConnectRequest}
            requestGroupsMetadata={requestGroupsMetadata}
            // groupMetadataClaimRequestEligibilities={
            //   groupMetadataClaimRequestEligibilities
            // }

            // authRequestEligibilities={authRequestEligibilities}

            referrerUrl={referrerUrl}
            onNext={() => {
              setStep("ImportEligibleAccount");
              return;
            }}
          />
        )}
        {step !== "SignIn" && (
          <LayoutFlow
            requestGroupsMetadata={requestGroupsMetadata}
            // groupMetadataDataRequestEligibilities={
            //   groupMetadataDataRequestEligibilities
            // }
            factoryApp={factoryApp}
            hostName={hostName}
            referrerUrl={referrerUrl}
            sismoConnectRequest={sismoConnectRequest}
            vaultSliderOpen={vaultSliderOpen}
            setVaultSliderOpen={setVaultSliderOpen}
            step={step}
          >
            {step === "ImportEligibleAccount" && (
              <ImportEligibleAccount
                selectedSismoConnectRequest={selectedSismoConnectRequest}
                onUserInput={onUserInput}
                requestGroupsMetadata={requestGroupsMetadata}
                authRequestEligibilities={authRequestEligibilities}
                groupMetadataClaimRequestEligibilities={
                  groupMetadataClaimRequestEligibilities
                }
                // groupMetadataDataRequestEligibilities={
                //   groupMetadataDataRequestEligibilities
                // }
                loadingEligible={loadingEligible}
                onNext={() => {
                  setStep("GenerateZkProof");
                }}
              />
            )}
            {step === "GenerateZkProof" && (
              <GenerateZkProof
                selectedSismoConnectRequest={selectedSismoConnectRequest}
                onNext={(response) => {
                  setTimeout(() => {
                    redirect(response);
                  }, 2000);
                }}
              />
            )}
          </LayoutFlow>
        )}
      </Container>
    </>
  );
}
