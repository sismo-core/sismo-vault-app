import styled from "styled-components";
import { useCallback, useState } from "react";

import { useVault } from "../../../hooks/vault";
import { useSismo } from "../../../hooks/sismo";
import * as Sentry from "@sentry/react";
import { ArrowLeft, ArrowSquareOut, Info, Warning } from "phosphor-react";
import { FactoryApp } from "../../../libs/sismo-client";

import {
  SismoConnectResponse,
  SelectedSismoConnectRequest,
  RequestGroupMetadata,
  SismoConnectRequest,
} from "../../../libs/sismo-connect-provers/sismo-connect-prover-v1";
import HoverTooltip from "../../../components/HoverTooltip";
import colors from "../../../theme/colors";
import { capitalizeFirstLetter } from "../../../utils/capitalizeFirstLetter";
import Button from "../../../components/Button";
import DataRequests from "./DataRequests";
import ProofModal from "./components/ProofModal";
import { SignatureRequest } from "./components/SignatureRequest";
import SignInButton from "../../../components/SignInButton";

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  padding: 40px 24px;
  background: ${(props) => props.theme.colors.blue11};
  border-radius: 10px;
  z-index: 2;
  box-sizing: border-box;
`;

const Title = styled.div`
  font-size: 14px;
  line-height: 20px;
  font-family: ${(props) => props.theme.fonts.bold};
  color: ${(props) => props.theme.colors.blue0};
`;

const GoBack = styled.div`
  position: absolute;
  top: -25px;
  right: 592px;
  cursor: pointer;
  font-size: 14px;
  color: ${(props) => props.theme.colors.blue0};
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
`;

const ContentTitle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
`;

const AppLogo = styled.img`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  margin-bottom: 12px;
`;

const SecondLine = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  font-family: ${(props) => props.theme.fonts.semibold};
  color: ${(props) => props.theme.colors.blue0};
  font-size: 20px;
  line-height: 24px;
`;

const CallToAction = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 252px;
  align-self: center;
  gap: 10px;
`;

const LinkWrapper = styled.a`
  display: flex;
  align-self: flex-end;
  align-items: center;
  justify-content: center;
  gap: 3px;

  font-size: 12px;
  line-height: 18px;

  color: ${(props) => props.theme.colors.blue4};
  font-family: ${(props) => props.theme.fonts.medium};
  text-decoration: none;
`;

const WarningWrapper = styled.div`
  flex-shrink: 0;
`;

const ImpersonatedBanner = styled.div`
  display: flex;
  gap: 12px;

  width: 100%;
  padding: 12px 16px;

  background-color: ${(props) => props.theme.colors.orange2};
  color: ${(props) => props.theme.colors.orange5};
  border-radius: 5px;
  font-size: 14px;

  box-sizing: border-box;
  margin-bottom: 24px;
`;

const ImpersonatedDescription = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ImpersonatedTitle = styled.div`
  font-family: ${(props) => props.theme.fonts.bold};
  font-size: 14px;
`;

const ImpersonatedText = styled.div`
  font-family: ${(props) => props.theme.fonts.medium};
`;

type Props = {
  isImpersonated: boolean;
  requestGroupsMetadata: RequestGroupMetadata[];
  sismoConnectRequest: SismoConnectRequest;
  factoryApp: FactoryApp;
  callbackUrl: string;
  hostName: string;
  onResponse: (response: SismoConnectResponse) => void;
};

export default function ConnectFlow({
  isImpersonated,
  requestGroupsMetadata,
  sismoConnectRequest,
  factoryApp,
  callbackUrl,
  hostName,
  onResponse,
}: Props): JSX.Element {
  const [loadingProof, setLoadingProof] = useState(false);
  const [, setErrorProof] = useState(false);
  const [response, setResponse] = useState<SismoConnectResponse>();
  const [registryTreeRoot, setRegistryTreeRoot] = useState<string>();
  const [proofModalOpen, setProofModalOpen] = useState(false);

  const [isEligible, setIsEligible] = useState(false);
  const [selectedSismoConnectRequest, setSelectedSismoConnectRequest] =
    useState<SelectedSismoConnectRequest | null>(null);

  const { getRegistryTreeRoot, generateResponse } = useSismo();
  const vault = useVault();

  /* ***************************************************** */
  /* ************* GENERATE RESPONSE ********************* */
  /* ***************************************************** */

  const generate = async () => {
    setLoadingProof(true);
    setErrorProof(false);
    try {
      const vaultSecret = await vault.getVaultSecret();
      console.time("generateResponse");
      const _sismoConnectResponse = await generateResponse(
        selectedSismoConnectRequest,
        requestGroupsMetadata,
        vault.importedAccounts,
        vaultSecret
      );
      console.timeEnd("generateResponse");
      setErrorProof(false);
      setLoadingProof(false);
      setResponse(_sismoConnectResponse);

      if (
        selectedSismoConnectRequest?.devConfig?.displayRawResponse ||
        selectedSismoConnectRequest?.displayRawResponse
      ) {
        const registryTreeRoot = await getRegistryTreeRoot(
          selectedSismoConnectRequest
        );
        setRegistryTreeRoot(registryTreeRoot);
        setProofModalOpen(true);
        return;
      }
      onResponse(_sismoConnectResponse);
    } catch (e) {
      Sentry.withScope(function (scope) {
        scope.setLevel("fatal");
        Sentry.captureException(e);
      });
      console.error(e);
      setErrorProof(true);
    }
    setLoadingProof(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  /* ***************************************************** */
  /* *********************** UTILS *********************** */
  /* ***************************************************** */

  const goBack = () => {
    if (window.opener) {
      window.opener.postMessage(null, callbackUrl);
      window.close();
    } else {
      window.location.href = callbackUrl;
    }
  };

  const onSelectedSismoConnectRequest = useCallback(
    (selectedSismoRequest) =>
      setSelectedSismoConnectRequest(selectedSismoRequest),
    []
  );

  return (
    <>
      <ProofModal
        response={response}
        registryTreeRoot={registryTreeRoot}
        isOpen={proofModalOpen}
        onClose={() => setProofModalOpen(false)}
      />
      <Container>
        {hostName && (
          <GoBack onClick={() => goBack()}>
            <ArrowLeft style={{ marginRight: 15 }} />
            Go back to {hostName}
          </GoBack>
        )}
        <ContentTitle>
          <AppLogo src={factoryApp?.logoUrl} alt={factoryApp?.name} />
          <SecondLine>
            Connect to {capitalizeFirstLetter(factoryApp?.name)}
            <HoverTooltip
              width={300}
              text="Your Data Vault is safe! Connecting to this app will not grant access to the data inside. Only the specified data will be shared."
            >
              <Info size={14} color={colors.blue0} />
            </HoverTooltip>
          </SecondLine>
        </ContentTitle>

        {isImpersonated && (
          <ImpersonatedBanner>
            <WarningWrapper>
              <Warning size={28} color={colors.orange5} />
            </WarningWrapper>
            <ImpersonatedDescription>
              <ImpersonatedTitle>Impersonated mode</ImpersonatedTitle>
              <ImpersonatedText>
                The generated proof is based on impersonated accounts. It should
                not be used in production.
              </ImpersonatedText>
            </ImpersonatedDescription>
          </ImpersonatedBanner>
        )}

        <Title style={{ marginBottom: 8 }}>
          {factoryApp?.name} wants you to:
        </Title>

        <DataRequests
          sismoConnectRequest={sismoConnectRequest}
          requestGroupsMetadata={requestGroupsMetadata}
          selectedSismoConnectRequest={selectedSismoConnectRequest}
          proofLoading={loadingProof}
          onSelectedSismoRequest={onSelectedSismoConnectRequest}
          onEligible={(_isEligible) => {
            setIsEligible(_isEligible);
          }}
        />

        {sismoConnectRequest?.signature?.message?.length > 0 && (
          <SignatureRequest
            onSelectedSismoRequest={onSelectedSismoConnectRequest}
            sismoConnectRequest={sismoConnectRequest}
            selectedSismoConnectRequest={selectedSismoConnectRequest}
            proofLoading={loadingProof}
          />
        )}

        <CallToAction>
          <LinkWrapper
            href="https://docs.sismo.io/sismo-docs/discover-sismo-connect"
            target="_blank"
          >
            What is Sismo Connect
            <ArrowSquareOut size={12} color={colors.blue4} weight="bold" />
          </LinkWrapper>

          {vault.isConnected ? (
            <Button
              success
              style={{ width: 252 }}
              onClick={() => generate()}
              loading={loadingProof}
              disabled={!isEligible}
            >
              Generate ZK proof
            </Button>
          ) : (
            <SignInButton />
          )}
        </CallToAction>
      </Container>
    </>
  );
}
