import styled from "styled-components";
import { Check } from "phosphor-react";
import colors from "../../../../../theme/colors";
import Logo, { LogoType } from "../../../../../components/Logo";
import ThreeDotsLoader from "../../../../../components/ThreeDotsLoader";
import { useCallback, useEffect, useState } from "react";
import { useVault } from "../../../../../libs/vault";
import { useSismo } from "../../../../../libs/sismo";
import Web2PrivacyModal from "../../components/Web2PrivacyModal";
import * as Sentry from "@sentry/react";
import { AccountData } from "../../../../../libs/sismo-client/provers/types";
import { RequestParamsType } from "../../..";
import { SnarkProof } from "@sismo-core/hydra-s1";

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

const VaultIconWrapper = styled.div`
  width: 55px;
  height: 45px;
  position: relative;
`;

const VaultIcon = styled.img`
  width: 45px;
  height: 45px;
`;

const GreenCircle = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${(props) => props.theme.colors.green1};
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
  margin-top: 21px;
`;

const ProofSuccessWrapper = styled.div`
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
  requestParams: RequestParamsType;
  eligibleAccountData: AccountData;
  onNext: (proof: SnarkProof) => void;
};

export default function GenerateZkProof({
  eligibleAccountData,
  requestParams,
  onNext,
}: Props) {
  const vault = useVault();
  const [web2PrivacyIsOpen, setWeb2PrivacyIsOpen] = useState(false);
  const [loadingProof, setLoadingProof] = useState(false);
  const [proof, setProof] = useState<SnarkProof>(null);
  const [, setErrorProof] = useState(false);
  const sismo = useSismo();

  const generateProof = useCallback(async () => {
    setLoadingProof(true);
    setErrorProof(false);
    try {
      const eligibleSourceAccount = vault.importedAccounts.find(
        (_source) => _source.identifier === eligibleAccountData.identifier
      );

      const proofRequest = {
        appId: requestParams.appId,
        serviceName: requestParams.serviceName,
        acceptHigherValues:
          requestParams.targetGroup.additionalProperties.acceptHigherValues,
        value: requestParams.targetGroup.value,
        source: eligibleSourceAccount,
        groupId: requestParams.targetGroup.groupId,
        groupTimestamp: requestParams.targetGroup.timestamp,
      };

      const proof = await sismo.generateOffchainProof(proofRequest);
      setProof(proof);
      setErrorProof(false);
      setLoadingProof(false);
      onNext(proof);
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

  const web2AccountVerification = useCallback(() => {
    const source = vault.importedAccounts.find(
      (_source) => _source.identifier === eligibleAccountData?.identifier
    );
    if (source.type !== "ethereum") {
      const msBetweenDates = Math.abs(source.timestamp - Date.now());
      const hoursBetweenDates = msBetweenDates / (60 * 60 * 1000);
      if (hoursBetweenDates < 24) {
        setWeb2PrivacyIsOpen(true);
        return;
      }
    }
    generateProof();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (requestParams?.version?.startsWith("off-chain")) {
      web2AccountVerification();
    } else {
      generateProof();
    }
  }, [generateProof, requestParams?.version, web2AccountVerification]);

  return (
    <Container>
      <Web2PrivacyModal
        isOpen={web2PrivacyIsOpen}
        onClose={() => setWeb2PrivacyIsOpen(false)}
        onContinue={() => {
          setWeb2PrivacyIsOpen(false);
          generateProof();
        }}
      />

      <Summary>
        <HeaderWrapper>
          <ContentHeader>
            <Logo type={LogoType.PROOF} color={colors.blue0} size={22.61} />
            ZK Proof Generation
          </ContentHeader>
        </HeaderWrapper>
      </Summary>

      {!proof && loadingProof && (
        <LoadingWrapper>
          <Schema>
            <VaultIconWrapper>
              <VaultIcon src="/assets/sismo-vault-v2.svg" alt="vault" />
              <GreenCircle>
                <Check size={12.73} color={colors.blue10} weight="bold" />
              </GreenCircle>
            </VaultIconWrapper>
            <ThreeDotsLoader />
            <Logo type={LogoType.PROOF} size={53.56} color={`#8F826A`} />
          </Schema>
          <LoadingFeedBack>Generating ZK Proof...</LoadingFeedBack>
        </LoadingWrapper>
      )}

      {proof && (
        <SuccessWrapper>
          <ProofSuccessWrapper>
            <Logo type={LogoType.PROOF} size={83.32} color={colors.orange2} />
          </ProofSuccessWrapper>
          <FeedBack>
            <div>ZK Proof generated!</div>
            <Check size={18} color={colors.green1} weight="bold" />
          </FeedBack>
        </SuccessWrapper>
      )}
    </Container>
  );
}
