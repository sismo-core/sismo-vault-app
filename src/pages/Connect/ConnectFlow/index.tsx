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
import { ZkConnectRequest } from "../localTypes";
import env from "../../../environment";
import { FactoryApp } from "../../../libs/sismo-client";
import { ZkConnectResponse } from "../localTypes";
import {
  GroupMetadataDataRequestEligibility,
  RequestGroupMetadata,
} from "../../../libs/sismo-client/zk-connect-prover/zk-connect-v2";
import { getZkConnectResponseBytes } from "../../../libs/sismo-client/zk-connect-prover/zk-connect-v2/utils/getZkConnectResponseBytes";

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
  zkConnectRequest: ZkConnectRequest;
  requestGroupsMetadata: RequestGroupMetadata[];
  callbackUrl: string;
  referrerUrl: string;
  hostName: string;
};

export default function ConnectFlow({
  factoryApp,
  zkConnectRequest,
  requestGroupsMetadata,
  referrerUrl,
  callbackUrl,
  hostName,
}: Props): JSX.Element {
  const vault = useVault();
  const [vaultSliderOpen, setVaultSliderOpen] = useState(false);
  const [
    groupMetadataDataRequestEligibilities,
    setGroupMetadataDataRequestEligibilities,
  ] = useState<GroupMetadataDataRequestEligibility[] | null>(null);
  const [step, setStep] = useState<Step>("SignIn");
  const [loadingEligible, setLoadingEligible] = useState(true);
  const { getDataRequestEligibilities } = useSismo();

  //TODO use statements in components

  //Test Eligibility
  useEffect(() => {
    if (!zkConnectRequest) return;

    const testEligibility = async () => {
      if (!zkConnectRequest?.requestContent) {
        return;
      }
      try {
        setLoadingEligible(true);
        const dataRequestEligibilities = await getDataRequestEligibilities(
          zkConnectRequest,
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
    zkConnectRequest,
  ]);

  const redirect = (response: ZkConnectResponse) => {
    localStorage.removeItem("prove_referrer");
    let url = callbackUrl;
    if (response) {
      url += `?zkConnectResponse=${JSON.stringify(
        response
      )}&zkConnectResponseBytes=${getZkConnectResponseBytes(response)}`;
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
            zkConnectRequest={zkConnectRequest}
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
            zkConnectRequest={zkConnectRequest}
            vaultSliderOpen={vaultSliderOpen}
            setVaultSliderOpen={setVaultSliderOpen}
            step={step}
          >
            {step === "ImportEligibleAccount" && (
              <ImportEligibleAccount
                zkConnectRequest={zkConnectRequest}
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
                zkConnectRequest={zkConnectRequest}
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
