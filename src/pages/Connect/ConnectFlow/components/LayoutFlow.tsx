import styled from "styled-components";
import { useRef, useEffect, useState } from "react";
import { capitalizeFirstLetter } from "../../../../utils/capitalizeFirstLetter";
import HeaderTitle from "./HeaderTitle";
import Stepper from "./Stepper";
import VaultSlider from "./VaultSlider";
import { useImportAccount } from "../../../Modals/ImportAccount/provider";
//import { ZkConnectRequest } from "@sismo-core/zk-connect-client";
import { ZkConnectRequest } from "../../localTypes";
import ShardTag from "./ShardTag";
import { BigNumber } from "ethers";
import { FactoryApp, GroupMetadata } from "../../../../libs/sismo-client";
import EligibilityModal from "./EligibilityModal";
import { RequestGroupMetadata } from "../../../../libs/sismo-client/zk-connect-prover/zk-connect-v1";

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

const HeaderBlock = styled.div<{ hasClaimRequest: boolean }>`
  background-color: ${(props) => props.theme.colors.blue11};
  border-radius: 10px;
  padding: ${(props) =>
    props.hasClaimRequest ? "20px 30px 25px 30px" : "20px 30px 20px 30px"};

  display: flex;
  flex-direction: ${(props) => (props.hasClaimRequest ? "column" : "row")};
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
  width: 100%;
`;

const FirstLine = styled.span``;

const SecondLine = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
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
  requestGroupsMetadata: RequestGroupMetadata[];
  zkConnectRequest: ZkConnectRequest;
  referrerUrl: string;
  hostName: string;
  vaultSliderOpen: boolean;
  children: React.ReactNode;
  proofLoading?: boolean;
  factoryApp: FactoryApp;
  step: "SignIn" | "ImportEligibleAccount" | "GenerateZkProof" | "Redirecting";
  setVaultSliderOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function LayoutFlow({
  requestGroupsMetadata,
  zkConnectRequest,
  hostName,
  referrerUrl,
  children,
  vaultSliderOpen,
  factoryApp,
  proofLoading = false,
  step,
  setVaultSliderOpen,
}: Props) {
  const [initialGroupId, setInitialGroupId] = useState<string | null>(null);
  // const proveName = badge?.name?.split(" ZK Badge")[0] || badge?.name;
  // const article = ["a", "e", "i", "o", "u"].includes(badge?.name) ? "an" : "a";

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const stepperWidth = ref.current?.offsetWidth;
  const importAccount = useImportAccount();

  useEffect(() => {
    if (importAccount?.importing === "account") {
      setVaultSliderOpen(true);
    }
  }, [importAccount?.importing, setVaultSliderOpen]);

  function onShardClick(groupId: string) {
    setModalIsOpen(true);
    setInitialGroupId(groupId);
  }

  return (
    <>
      {Boolean(requestGroupsMetadata) && (
        <EligibilityModal
          isOpen={modalIsOpen}
          onClose={() => setModalIsOpen(false)}
          requestGroupsMetadata={requestGroupsMetadata}
          initialGroupId={initialGroupId}
        />
      )}
      <Container>
        <HeaderBlock hasClaimRequest={Boolean(requestGroupsMetadata)}>
          <HeaderTitle url={referrerUrl} />
          {!Boolean(requestGroupsMetadata) && (
            <BadgeWrapper>
              <BadgeImg src={factoryApp?.logoUrl} alt={factoryApp?.name} />
            </BadgeWrapper>
          )}
          {Boolean(requestGroupsMetadata) && (
            <Summary>
              <BadgeWrapper>
                <BadgeImg src={factoryApp?.logoUrl} alt={factoryApp?.name} />
              </BadgeWrapper>

              <SummaryText>
                <FirstLine>
                  <Bold>{capitalizeFirstLetter(factoryApp?.name)}</Bold> wants
                  to verify that you own
                </FirstLine>
                <SecondLine>
                  {Boolean(requestGroupsMetadata) &&
                    requestGroupsMetadata?.map(
                      (requestGroupMetadata, index) => (
                        <>
                          {zkConnectRequest?.requestContent?.operators[0] ===
                            "OR" &&
                            index !== 0 && <div>or</div>}
                          <ShardTag
                            key={
                              requestGroupMetadata?.groupMetadata?.id +
                              "/statement-request/layout"
                            }
                            groupMetadata={requestGroupMetadata?.groupMetadata}
                            claimType={requestGroupMetadata?.claim?.claimType}
                            requestedValue={
                              BigNumber.from(
                                requestGroupMetadata?.claim?.value
                              ).toNumber() || 1
                            }
                            onModal={() =>
                              onShardClick(
                                requestGroupMetadata?.groupMetadata?.id
                              )
                            }
                          />
                        </>
                      )
                    )}
                </SecondLine>
              </SummaryText>
            </Summary>
          )}
        </HeaderBlock>

        <ContentWrapper>
          <ContentBlock>
            {children}
            <StepperBlock
              hostName={hostName}
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
    </>
  );
}
