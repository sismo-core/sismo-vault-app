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
import { SismoConnectRequest } from "../localTypes";
import env from "../../../environment";
import { FactoryApp } from "../../../libs/sismo-client";
import { SismoConnectResponse } from "../localTypes";

import { getSismoConnectResponseBytes } from "../../../libs/sismo-client/sismo-connect-prover/sismo-connect-v1/utils/getSismoConnectResponseBytes";
import {
  GroupMetadataClaimRequestEligibility,
  RequestGroupMetadata,
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
  // const [
  //   groupMetadataDataRequestEligibilities,
  //   setGroupMetadataDataRequestEligibilities,
  // ] = useState<GroupMetadataDataRequestEligibility[] | null>(null);

  const [
    groupMetadataClaimRequestEligibility,
    setGroupMetadataClaimRequestEligibility,
  ] = useState<GroupMetadataClaimRequestEligibility[] | null>(null);

  const [step, setStep] = useState<Step>("SignIn");
  const [loadingEligible, setLoadingEligible] = useState(true);
  const { getDataRequestEligibilities } = useSismo();

  //TODO use statements in components

  //Test Eligibility
  useEffect(() => {
    if (!sismoConnectRequest) return;

    const testEligibility = async () => {
      if (!sismoConnectRequest?.requestContent) {
        return;
      }
      try {
        setLoadingEligible(true);
        const dataRequestEligibilities = await getDataRequestEligibilities(
          sismoConnectRequest,
          vault?.importedAccounts || []
        );

        const groupMetadataDataRequestEligibilities =
          dataRequestEligibilities.map((dataRequestEligibility) => {
            const requestGroupMetadata = requestGroupsMetadata?.find(
              (requestGroupMetadata) =>
                requestGroupMetadata?.groupMetadata?.id ===
                dataRequestEligibility?.claimRequestEligibility?.claimRequest
                  ?.groupId
            );

            return {
              ...dataRequestEligibility,
              claimRequestEligibility: {
                ...dataRequestEligibility.claimRequestEligibility,
                groupMetadata: requestGroupMetadata?.groupMetadata,
              },
            } as GroupMetadataDataRequestEligibility;
          });

        setGroupMetadataDataRequestEligibilities(
          groupMetadataDataRequestEligibilities
        );
        setLoadingEligible(false);
      } catch (e) {
        Sentry.captureException(e);
        setLoadingEligible(false);
        console.log("ERROR", e);
      }
    };
    testEligibility();
  }, [
    getDataRequestEligibilities,
    requestGroupsMetadata,
    vault.importedAccounts,
    sismoConnectRequest,
  ]);

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

  // Routing to first step whenever the user is not connected
  useEffect(() => {
    if (!vault.isConnected) {
      setStep("SignIn");
    }
  }, [vault.isConnected]);

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
            groupMetadataDataRequestEligibilities={
              groupMetadataDataRequestEligibilities
            }
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
            groupMetadataDataRequestEligibilities={
              groupMetadataDataRequestEligibilities
            }
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
                sismoConnectRequest={sismoConnectRequest}
                requestGroupsMetadata={requestGroupsMetadata}
                groupMetadataDataRequestEligibilities={
                  groupMetadataDataRequestEligibilities
                }
                loadingEligible={loadingEligible}
                onNext={() => {
                  setStep("GenerateZkProof");
                }}
              />
            )}
            {step === "GenerateZkProof" && (
              <GenerateZkProof
                sismoConnectRequest={sismoConnectRequest}
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
