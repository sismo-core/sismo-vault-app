import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import SignIn from "./steps/0_SignIn";
import ImportEligibleAccount from "./steps/1_ImportEligibleAccount";
import GenerateZkProof from "./steps/2_GenerateZkProof";
import LayoutFlow from "./components/LayoutFlow";
import { useVault } from "../../../libs/vault";
import { useSismo } from "../../../libs/sismo";
import * as Sentry from "@sentry/react";
import { FactoryAppType, GroupMetadata, PWS_VERSION } from "..";
import { ZkConnectRequest } from "../../../libs/sismo-client/provers/types";
import { AccountData } from "../../../libs/sismo-client/provers/types";
import { SnarkProof } from "@sismo-core/hydra-s1";
import { ArrowLeft } from "phosphor-react";

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
  factoryApp: FactoryAppType;
  zkConnectRequest: ZkConnectRequest;
  isDataRequest: boolean | null;
  groupMetadata: GroupMetadata;
  callbackUrl: string;
  referrerUrl: string;
  referrerName: string;
};

export default function PwSFlow({
  factoryApp,
  zkConnectRequest,
  isDataRequest,
  groupMetadata,
  referrerName,
  referrerUrl,
  callbackUrl,
}: Props): JSX.Element {
  const vault = useVault();
  const sismo = useSismo();
  const [vaultSliderOpen, setVaultSliderOpen] = useState(false);
  const [eligibleAccountData, setEligibleAccountData] = useState<AccountData>();
  const [step, setStep] = useState<Step>("SignIn");
  const [loadingEligible, setLoadingEligible] = useState(true);

  //Test Eligibility
  useEffect(() => {
    if (!vault?.importedAccounts) return;
    if (!zkConnectRequest) return;

    const testEligibility = async () => {
      try {
        setLoadingEligible(true);
        const importedAccountIdentifiers = vault.importedAccounts.map(
          (account) => account.identifier
        );
        const accountData = await sismo.getEligibility({
          accounts: importedAccountIdentifiers,
          groupId: zkConnectRequest.dataRequest.statementRequests[0].groupId,
          groupTimestamp:
            zkConnectRequest.dataRequest.statementRequests[0].groupTimestamp,
          requestedValue:
            zkConnectRequest.dataRequest.statementRequests[0].requestedValue,
          comparator:
            zkConnectRequest.dataRequest.statementRequests[0].comparator,
        });
        setEligibleAccountData(accountData);
        setLoadingEligible(false);
      } catch (e) {
        Sentry.captureException(e);
        setLoadingEligible(false);
      }
    };
    testEligibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vault?.importedAccounts, zkConnectRequest]);

  const redirect = (snarkProof?: SnarkProof) => {
    localStorage.removeItem("prove_referrer");
    let url = `${callbackUrl}`;
    let pwsProof = null;
    if (snarkProof) {
      // pwsProof = {
      //   appId: factoryApp.id,
      //   serviceName: requestParams.namespace,
      //   membershipProofs: [
      //     {
      //       proofId: snarkProof.input[6],
      //       groupId: requestParams.targetGroup.groupId,
      //       value: snarkProof.input[7],
      //       timestamp: requestParams.targetGroup.timestamp,
      //       additionalProperties: null,
      //       provingScheme: "hydraS1",
      //       version: "1.0.7",
      //       proof: snarkProof,
      //     },
      //   ],
      //   version: PWS_VERSION,
      // };
      url += `?pwsProof=${JSON.stringify(pwsProof)}`;
    }
    if (window.opener) {
      window.opener.postMessage(pwsProof, url); //If it's a popup, this will send a message to the opener which is here zkdrop.io
      window.close(); //Close the popup
    } else {
      //   window.location.href = url; //If it's not a popup return the proof in params or url
    }
  };

  const onStepChange = useCallback((step: Step) => {
    setStep(step);
  }, []);

  // Routing to first step whenever the user is not connected
  useEffect(() => {
    if (!vault.isConnected) {
      setStep("SignIn");
    }
  }, [vault.isConnected]);

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

  // 2 seconds routing after imports and proof generation
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (eligibleAccountData) {
      if (step === "ImportEligibleAccount") {
        timeout = setTimeout(() => {
          onStepChange("GenerateZkProof");
        }, 2000);
        return;
      }
    }

    if (!eligibleAccountData && step === "GenerateZkProof") {
      onStepChange("ImportEligibleAccount");
      return;
    }

    return () => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligibleAccountData, step, onStepChange]);

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
        <GoBack onClick={() => goBack()}>
          <ArrowLeft style={{ marginRight: 15 }} />
          Go back to {referrerName}
        </GoBack>
        {step === "SignIn" && (
          <SignIn
            factoryApp={factoryApp}
            referrerName={referrerName}
            groupMetadata={groupMetadata}
            referrerUrl={referrerUrl}
            onNext={() => {
              setStep("ImportEligibleAccount");
              return;
            }}
          />
        )}
        {step !== "SignIn" && (
          <LayoutFlow
            groupMetadata={groupMetadata}
            factoryApp={factoryApp}
            referrerName={referrerName}
            referrerUrl={referrerUrl}
            vaultSliderOpen={vaultSliderOpen}
            setVaultSliderOpen={setVaultSliderOpen}
            step={step}
          >
            {step === "ImportEligibleAccount" && (
              <ImportEligibleAccount
                groupMetadata={groupMetadata}
                eligibleAccountData={eligibleAccountData}
                loadingEligible={loadingEligible}
              />
            )}
            {step === "GenerateZkProof" && (
              <GenerateZkProof
                zkConnectRequest={zkConnectRequest}
                eligibleAccountData={eligibleAccountData}
                onNext={(proof) => {
                  setTimeout(() => {
                    redirect(proof);
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
