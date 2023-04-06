import styled from "styled-components";
import { Check } from "phosphor-react";
import colors from "../../../../../theme/colors";
import { useCallback, useEffect, useState } from "react";
import { useVault } from "../../../../../libs/vault";
import { useSismo } from "../../../../../libs/sismo";
import * as Sentry from "@sentry/react";
import ShardAnimation from "../../components/ShardAnimation";
import { Gem, GemProof } from "../../../../../components/SismoReactIcon";
import ProofModal from "./components/ProofModal";
import {
  SismoConnectRequest,
  SismoConnectResponse,
} from "../../../../../libs/sismo-client/sismo-connect-prover/sismo-connect-v1";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 49px;
`;

const ContentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  line-height: 20px;
  font-family: ${(props) => props.theme.fonts.medium};
  color: ${(props) => props.theme.colors.blue0};
`;

const Summary = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 50px;
`;

const Schema = styled.div`
  display: flex;
  align-items: center;
  gap: 22px;
  align-self: center;
`;

const LoadingWrapper = styled.div`
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
`;

const SuccessWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
  margin-top: 37px;
`;

const ProofSuccessWrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const FeedBack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  font-size: 16px;
  line-height: 22px;
  ${(props) => props.theme.fonts.medium};
  color: ${(props) => props.theme.colors.blue0};
  gap: 15px;

  height: 55px;

  margin-top: 32px;
  margin-bottom: 46px;
  box-sizing: border-box;
`;

const LoadingFeedBack = styled(FeedBack)`
  font-style: italic;
`;

type Props = {
  sismoConnectRequest: SismoConnectRequest;
  onNext: (zkResponse: SismoConnectResponse) => void;
};

export default function GenerateZkProof({
  sismoConnectRequest,
  onNext,
}: Props) {
  const vault = useVault();
  const [loadingProof, setLoadingProof] = useState(true);
  const [isGenerated, setIsGenerated] = useState(false);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [, setErrorProof] = useState(false);
  const [response, setResponse] = useState<any | null>(null);
  const { generateResponse } = useSismo();

  const generate = useCallback(async () => {
    setLoadingProof(true);
    setErrorProof(false);
    try {
      const vaultSecret = await vault.getVaultSecret(vault.connectedOwner);
      const zkResponse = await generateResponse(
        sismoConnectRequest,
        vault.importedAccounts,
        vaultSecret
      );
      setIsGenerated(true);
      setErrorProof(false);
      setLoadingProof(false);
      setResponse(zkResponse);

      if (sismoConnectRequest?.devConfig?.displayRawResponse) {
        setProofModalOpen(true);
        return;
      }
      onNext(zkResponse);
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
  }, []);

  useEffect(() => {
    generate();
  }, [generate]);

  return (
    <>
      <ProofModal
        response={response}
        isOpen={proofModalOpen}
        onClose={() => setProofModalOpen(false)}
      />
      <Container>
        <Summary>
          <HeaderWrapper>
            <ContentHeader>
              <Gem color={colors.blue0} size={19} />
              ZK Proof Generation
            </ContentHeader>
          </HeaderWrapper>
        </Summary>

        {!isGenerated && loadingProof && (
          <LoadingWrapper>
            <Schema>
              <ShardAnimation />
            </Schema>
            <LoadingFeedBack>Generating ZK Proof...</LoadingFeedBack>
          </LoadingWrapper>
        )}

        {isGenerated && (
          <SuccessWrapper>
            <ProofSuccessWrapper>
              <GemProof size={58} color={colors.purple2} />
            </ProofSuccessWrapper>
            <FeedBack>
              <div>ZK Proof generated!</div>
              <Check size={18} color={colors.green1} weight="bold" />
            </FeedBack>
          </SuccessWrapper>
        )}
      </Container>
    </>
  );
}
