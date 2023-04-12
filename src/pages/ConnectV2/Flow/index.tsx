import styled from "styled-components";
import { useState, useEffect } from "react";

import { useVault } from "../../../libs/vault";
import { useSismo } from "../../../libs/sismo";
import * as Sentry from "@sentry/react";
import {
  ArrowLeft,
  ArrowSquareOut,
  ArrowsOutSimple,
  Info,
} from "phosphor-react";
import env from "../../../environment";
import { FactoryApp } from "../../../libs/sismo-client";

import {
  AuthRequestEligibility,
  GroupMetadataClaimRequestEligibility,
  RequestGroupMetadata,
  SismoConnectRequest,
  SismoConnectResponse,
  SelectedSismoConnectRequest,
  SelectedAuthRequest,
} from "../../../libs/sismo-client/sismo-connect-prover/sismo-connect-v1";
import HoverTooltip from "../../../components/HoverTooltip";
import colors from "../../../theme/colors";
import { capitalizeFirstLetter } from "../../../utils/capitalizeFirstLetter";
import { getIsEligible } from "../utils/getIsEligible";
import Button from "../../../components/Button";
import { useImportAccount } from "../../Modals/ImportAccount/provider";
import DataRequests from "./components/DataRequests";
import ConnectVaultModal from "../../Modals/ConnectVaultModal";
import ProofModal from "./components/ProofModal";

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

const GoBack = styled.div`
  position: absolute;
  top: -71px;
  right: 592px;
  cursor: pointer;
  font-size: 14px;
  color: ${(props) => props.theme.colors.blue0};
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
`;

const TopContent = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
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

const Bold = styled.span`
  font-family: ${(props) => props.theme.fonts.bold};
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  margin: 0 auto;
  width: 252px;
`;

const Link = styled.a`
  align-self: flex-end;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font-family: ${(props) => props.theme.fonts.medium};
  color: ${(props) => props.theme.colors.blue4};
  font-size: 12px;
  line-height: 18px;
  text-decoration: none;
  cursor: pointer;
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

const EligibilityLink = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  line-height: 20px;
  font-family: ${(props) => props.theme.fonts.medium};
  color: ${(props) => props.theme.colors.blue2};
  gap: 5px;
  margin-top: 20px;
  margin-bottom: 12px;
`;

const ArrowWrapper = styled(ArrowsOutSimple)`
  align-self: flex-start;
`;

const TooltipContent = styled.div`
  font-size: 14px;
  line-height: 20px;
  color: ${(props) => props.theme.colors.blue0};
  font-family: ${(props) => props.theme.fonts.medium};

  display: flex;
  flex-direction: column;
  gap: 15px;
`;

type Props = {
  factoryApp: FactoryApp;
  selectedSismoConnectRequest?: SelectedSismoConnectRequest;
  authRequestEligibilities: AuthRequestEligibility[];
  groupMetadataClaimRequestEligibilities: GroupMetadataClaimRequestEligibility[];
  referrerUrl?: string;
  callbackUrl: string;
  hostName: string;
  loadingEligible: boolean;
  onUserInput: (
    selectedSismoConnectRequest: SelectedSismoConnectRequest
  ) => void;
  onResponse: (response: SismoConnectResponse) => void;
};

export default function ConnectFlow({
  factoryApp,
  selectedSismoConnectRequest,
  authRequestEligibilities,
  groupMetadataClaimRequestEligibilities,
  loadingEligible,
  referrerUrl,
  callbackUrl,
  hostName,

  onUserInput,
}: Props): JSX.Element {
  const [connectIsOpen, setConnectIsOpen] = useState(false);
  const [loadingProof, setLoadingProof] = useState(false);
  const [errorProof, setErrorProof] = useState(false);
  const [response, setResponse] = useState<SismoConnectResponse>();
  const [registryTreeRoot, setRegistryTreeRoot] = useState<string>();
  const [proofModalOpen, setProofModalOpen] = useState(false);

  const { getRegistryTreeRoot, generateResponse } = useSismo();
  const vault = useVault();

  const goBack = () => {
    if (window.opener) {
      window.opener.postMessage(null, callbackUrl);
      window.close();
    } else {
      window.location.href = callbackUrl;
    }
  };

  let isSismoConnectRequestEligible: boolean = getIsEligible(
    groupMetadataClaimRequestEligibilities,
    authRequestEligibilities
  );

  const generate = async () => {
    setLoadingProof(true);
    setErrorProof(false);
    try {
      const vaultSecret = await vault.getVaultSecret(vault.connectedOwner);
      const registryTreeRoot = await getRegistryTreeRoot(
        selectedSismoConnectRequest
      );

      setRegistryTreeRoot(registryTreeRoot);

      const sismoConnectResponse = await generateResponse(
        selectedSismoConnectRequest,
        vault.importedAccounts,
        vaultSecret
      );
      setErrorProof(false);
      setLoadingProof(false);
      setResponse(sismoConnectResponse);

      if (selectedSismoConnectRequest?.devConfig?.displayRawResponse) {
        setProofModalOpen(true);
        return;
      }
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

  return (
    <>
      <ProofModal
        response={response}
        registryTreeRoot={registryTreeRoot}
        isOpen={proofModalOpen}
        onClose={() => setProofModalOpen(false)}
      />
      <ConnectVaultModal
        isOpen={connectIsOpen}
        onClose={() => setConnectIsOpen(false)}
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
              text="Connecting with your Vault does not reveal the accounts inside. You only reveal your Vault ID—an anonymous app-specific identifier that authenticates ownership of a Data Vault. "
            >
              <Info size={14} color={colors.blue0} />
            </HoverTooltip>
          </SecondLine>
        </ContentTitle>

        <DataRequests
          authRequestEligibilities={authRequestEligibilities}
          groupMetadataClaimRequestEligibilities={
            groupMetadataClaimRequestEligibilities
          }
          selectedSismoConnectRequest={selectedSismoConnectRequest}
          appName={factoryApp?.name}
          onUserInput={onUserInput}
          loadingEligible={loadingEligible}
          proofLoading={loadingProof}
        />

        <CallToAction>
          <LinkWrapper
            href="https://docs.sismo.io/sismo-docs/readme/zkconnect"
            target="_blank"
          >
            What is sismoConnect
            <ArrowSquareOut size={12} color={colors.blue4} weight="bold" />
          </LinkWrapper>

          {vault.isConnected ? (
            <Button
              success
              style={{ width: 252 }}
              onClick={() => generate()}
              loading={loadingProof}
              disabled={!isSismoConnectRequestEligible}
            >
              Generate ZK proof
            </Button>
          ) : (
            <Button
              primary
              style={{ width: 252 }}
              onClick={() => setConnectIsOpen(true)}
            >
              Sign-in to Sismo
            </Button>
          )}
        </CallToAction>
      </Container>
    </>
  );
}
