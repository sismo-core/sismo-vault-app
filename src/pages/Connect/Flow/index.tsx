import styled from "styled-components";
import { useState, useEffect, useRef } from "react";

import { useVault } from "../../../libs/vault";
import { useSismo } from "../../../libs/sismo";
import * as Sentry from "@sentry/react";
import { ArrowLeft, ArrowSquareOut, Info } from "phosphor-react";
import { FactoryApp } from "../../../libs/sismo-client";

import {
  AuthRequestEligibility,
  GroupMetadataClaimRequestEligibility,
  SismoConnectResponse,
  SelectedSismoConnectRequest,
} from "../../../libs/sismo-client/sismo-connect-prover/sismo-connect-v1";
import HoverTooltip from "../../../components/HoverTooltip";
import colors from "../../../theme/colors";
import { capitalizeFirstLetter } from "../../../utils/capitalizeFirstLetter";
import { getIsEligible } from "../utils/getIsEligible";
import Button from "../../../components/Button";
import DataRequests from "./components/DataRequests";
import ConnectVaultModal from "../../Modals/ConnectVaultModal";
import ProofModal from "./components/ProofModal";
import { SignatureRequest } from "./components/SignatureRequest";
import { ImportedAccount } from "../../../libs/vault-client";

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
  onResponse,
  onUserInput,
}: Props): JSX.Element {
  const [connectIsOpen, setConnectIsOpen] = useState(false);
  const [loadingProof, setLoadingProof] = useState(false);
  const [, setErrorProof] = useState(false);
  const [response, setResponse] = useState<SismoConnectResponse>();
  const [registryTreeRoot, setRegistryTreeRoot] = useState<string>();
  const [proofModalOpen, setProofModalOpen] = useState(false);

  const { getRegistryTreeRoot, generateResponse } = useSismo();
  const vault = useVault();

  /* ************************************************************* */
  /* ********************* SET DEFAULT VALUE ********************* */
  /* ************************************************************* */

  const isDefaultSet = useRef(false);
  useEffect(() => {
    if (!selectedSismoConnectRequest) return;
    if (!authRequestEligibilities && !groupMetadataClaimRequestEligibilities)
      return;
    if (isDefaultSet.current) return;

    let newSelectedSismoConnectRequest: SelectedSismoConnectRequest = {
      ...selectedSismoConnectRequest,
    };

    if (selectedSismoConnectRequest?.signature?.message) {
      newSelectedSismoConnectRequest = {
        ...newSelectedSismoConnectRequest,
        selectedSignature: {
          ...newSelectedSismoConnectRequest?.signature,
          selectedMessage: selectedSismoConnectRequest?.signature?.message,
        },
      };
    }

    if (authRequestEligibilities?.length > 0) {
      for (const authRequestEligibility of authRequestEligibilities) {
        if (!authRequestEligibility?.accounts?.length) continue;

        let userAccount: ImportedAccount;

        if (authRequestEligibility?.auth?.userId === "0") {
          userAccount = authRequestEligibility?.accounts[0];
        }

        if (authRequestEligibility?.auth?.userId !== "0") {
          const defaultAccount = authRequestEligibility?.accounts.find(
            (account) =>
              account.identifier?.toLowerCase() ===
              authRequestEligibility?.auth?.userId?.toLowerCase()
          );

          if (defaultAccount) {
            userAccount = defaultAccount;
          } else {
            userAccount = authRequestEligibility?.accounts[0];
          }
        }
        newSelectedSismoConnectRequest = {
          ...newSelectedSismoConnectRequest,
          selectedAuths: newSelectedSismoConnectRequest?.selectedAuths?.map(
            (auth) => {
              if (auth?.uuid === authRequestEligibility?.auth?.uuid) {
                return {
                  ...auth,
                  selectedUserId: userAccount?.identifier,
                };
              } else {
                return auth;
              }
            }
          ),
        };
      }
    }

    if (groupMetadataClaimRequestEligibilities?.length > 0) {
      for (const groupMetadataClaimRequestEligibility of groupMetadataClaimRequestEligibilities) {
        if (!groupMetadataClaimRequestEligibility?.accountData) continue;

        const initialClaimValue =
          groupMetadataClaimRequestEligibility?.claim?.value;

        newSelectedSismoConnectRequest = {
          ...newSelectedSismoConnectRequest,
          selectedClaims: newSelectedSismoConnectRequest.selectedClaims.map(
            (claim) => {
              if (
                claim.uuid === groupMetadataClaimRequestEligibility?.claim?.uuid
              ) {
                return {
                  ...claim,
                  selectedValue: initialClaimValue,
                };
              } else {
                return claim;
              }
            }
          ),
        };
      }
    }

    isDefaultSet.current = true;
    onUserInput(newSelectedSismoConnectRequest);
  }, [
    selectedSismoConnectRequest,
    authRequestEligibilities,
    groupMetadataClaimRequestEligibilities,
    onUserInput,
  ]);

  /* ***************************************************** */
  /* ************* GENERATE RESPONSE ********************* */
  /* ***************************************************** */

  const generate = async () => {
    setLoadingProof(true);
    setErrorProof(false);
    try {
      const vaultSecret = await vault.getVaultSecret();
      const registryTreeRoot = await getRegistryTreeRoot(
        selectedSismoConnectRequest
      );

      setRegistryTreeRoot(registryTreeRoot);

      const _sismoConnectResponse = await generateResponse(
        selectedSismoConnectRequest,
        vault.importedAccounts,
        vaultSecret
      );
      setErrorProof(false);
      setLoadingProof(false);
      setResponse(_sismoConnectResponse);

      if (selectedSismoConnectRequest?.devConfig?.displayRawResponse) {
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

  let isSismoConnectRequestEligible: boolean = getIsEligible(
    groupMetadataClaimRequestEligibilities,
    authRequestEligibilities
  );

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
              text="Your Data Vault is safe! Connecting to this app will not grant access to the data inside. Only the specified data will be shared."
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

        {selectedSismoConnectRequest?.signature?.message?.length > 0 && (
          <SignatureRequest
            selectedSismoConnectRequest={selectedSismoConnectRequest}
            onUserInput={onUserInput}
            proofLoading={loadingProof}
          />
        )}

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
