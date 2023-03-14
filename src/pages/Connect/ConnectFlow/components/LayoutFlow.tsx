import styled from "styled-components";
import { useRef, useEffect } from "react";
import { capitalizeFirstLetter } from "../../../../utils/capitalizeFirstLetter";
import HeaderTitle from "./HeaderTitle";
import Stepper from "./Stepper";
import VaultSlider from "./VaultSlider";
import { useImportAccount } from "../../../Modals/ImportAccount/provider";
import { FactoryAppType, GroupMetadata } from "../..";
import { ZkConnectRequest } from "@sismo-core/zk-connect-client";
import ShardTag from "./ShardTag";
import { BigNumber } from "ethers";

const Container = styled.div`
  position: relative;
  color: ${(props) => props.theme.colors.blue0};
  width: 100%;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 10px;

  box-sizing: border-box;
`;

const HeaderBlock = styled.div<{ hasDataRequest: boolean }>`
  background-color: ${(props) => props.theme.colors.blue11};
  border-radius: 10px;
  padding: ${(props) =>
    props.hasDataRequest ? "20px 30px 25px 30px" : "20px 30px 20px 30px"};

  display: flex;
  flex-direction: ${(props) => (props.hasDataRequest ? "column" : "row")};
  justify-content: space-between;
  gap: 20px;

  box-sizing: border-box;
`;

const Summary = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-family: ${(props) => props.theme.fonts.regular};
  color: ${(props) => props.theme.colors.blue0};
`;

const BadgeWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  flex-shrink: 0;
  height: 50px;
  width: 50px;
`;

const BadgeImg = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  flex-shrink: 0;
  cursor: pointer;
`;

const SummaryText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 16px;
  line-height: 22px;
`;

const FirstLine = styled.span``;

const SecondLine = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const Bold = styled.span`
  font-family: ${(props) => props.theme.fonts.semibold};
`;

const ContentWrapper = styled.div`
  position: relative;
`;

const ContentBlock = styled.div`
  position: relative;
  background-color: ${(props) => props.theme.colors.blue11};
  border-radius: 10px;
  padding: 30px 30px 40px 30px;
  z-index: 4;
  box-sizing: border-box;
  min-height: 347px;
`;

const StepperBlock = styled(Stepper)<{ stepperWidth: number }>`
  position: absolute;
  width: 200px;
  top: 118px;
  left: calc(-200px - 30px);
`;

type Props = {
  groupMetadata: GroupMetadata;
  hasDataRequest: boolean;
  zkConnectRequest: ZkConnectRequest;
  referrerUrl: string;
  referrerName: string;
  vaultSliderOpen: boolean;
  children: React.ReactNode;
  proofLoading?: boolean;
  factoryApp: FactoryAppType;
  step: "SignIn" | "ImportEligibleAccount" | "GenerateZkProof" | "Redirecting";
  setVaultSliderOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function LayoutFlow({
  groupMetadata,
  zkConnectRequest,
  referrerName,
  referrerUrl,
  children,
  vaultSliderOpen,
  factoryApp,
  proofLoading = false,
  step,
  hasDataRequest,
  setVaultSliderOpen,
}: Props) {
  // const proveName = badge?.name?.split(" ZK Badge")[0] || badge?.name;
  // const article = ["a", "e", "i", "o", "u"].includes(badge?.name) ? "an" : "a";

  const ref = useRef<HTMLDivElement>(null);
  const stepperWidth = ref.current?.offsetWidth;
  const importAccount = useImportAccount();

  useEffect(() => {
    if (importAccount?.importing === "account") {
      setVaultSliderOpen(true);
    }
  }, [importAccount?.importing, setVaultSliderOpen]);

  return (
    <Container>
      <HeaderBlock hasDataRequest={hasDataRequest}>
        <HeaderTitle url={referrerUrl} />
        {!hasDataRequest && (
          <BadgeWrapper>
            <BadgeImg src={factoryApp?.logoUrl} alt={referrerName} />
          </BadgeWrapper>
        )}
        {hasDataRequest && (
          <Summary>
            <BadgeWrapper>
              <BadgeImg src={factoryApp?.logoUrl} alt={referrerName} />
            </BadgeWrapper>

            <SummaryText>
              <FirstLine>
                <Bold>{capitalizeFirstLetter(referrerName)}</Bold> wants to
                verify that you own
              </FirstLine>
              <SecondLine>
                <ShardTag
                  groupMetadata={groupMetadata}
                  comparator={
                    zkConnectRequest?.dataRequest?.statementRequests[0]
                      ?.comparator
                  }
                  requestedValue={
                    BigNumber.from(
                      zkConnectRequest?.dataRequest?.statementRequests[0]
                        ?.requestedValue
                    ).toNumber() || 1
                  }
                />
              </SecondLine>
            </SummaryText>
          </Summary>
        )}
      </HeaderBlock>

      <ContentWrapper>
        <ContentBlock>
          {children}
          <StepperBlock
            referrerName={referrerName}
            step={step}
            stepperWidth={stepperWidth}
          />
        </ContentBlock>
        <VaultSlider
          vaultSliderOpen={vaultSliderOpen}
          setVaultSliderOpen={setVaultSliderOpen}
          proofLoading={proofLoading}
        />
      </ContentWrapper>
    </Container>
  );
}
