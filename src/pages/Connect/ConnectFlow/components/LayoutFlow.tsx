import styled from "styled-components";
import { useRef, useEffect, useState, Fragment } from "react";
import { capitalizeFirstLetter } from "../../../../utils/capitalizeFirstLetter";
import HeaderTitle from "./HeaderTitle";
import Stepper from "./Stepper";
import VaultSlider from "./VaultSlider";
import { useImportAccount } from "../../../Modals/ImportAccount/provider";
import { ZkConnectRequest } from "../../localTypes";
import ShardTag from "./ShardTag";
import { FactoryApp } from "../../../../libs/sismo-client";
import EligibilityModal from "./EligibilityModal";
import {
  GroupMetadataDataRequestEligibility,
  RequestGroupMetadata,
  AuthType,
  ClaimType,
} from "../../../../libs/sismo-client/zk-connect-prover/zk-connect-v2";
import AuthTag from "./AuthTag";

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
  groupMetadataDataRequestEligibilities:
    | GroupMetadataDataRequestEligibility[]
    | null;
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
  groupMetadataDataRequestEligibilities,
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
      {Boolean(requestGroupsMetadata?.length) && (
        <EligibilityModal
          isOpen={modalIsOpen}
          onClose={() => setModalIsOpen(false)}
          requestGroupsMetadata={requestGroupsMetadata}
          initialGroupId={initialGroupId}
        />
      )}
      <Container>
        <HeaderBlock hasClaimRequest={Boolean(requestGroupsMetadata?.length)}>
          <HeaderTitle url={referrerUrl} />
          {!Boolean(requestGroupsMetadata?.length) && (
            <BadgeWrapper>
              <BadgeImg src={factoryApp?.logoUrl} alt={factoryApp?.name} />
            </BadgeWrapper>
          )}
          {Boolean(requestGroupsMetadata?.length) && (
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
                  {groupMetadataDataRequestEligibilities.length > 0 &&
                    groupMetadataDataRequestEligibilities?.map(
                      (dataRequestEligibility, index) => (
                        <Fragment key={index + "/statement-request/layout"}>
                          {zkConnectRequest?.requestContent?.operators[0] ===
                            "OR" &&
                            index !== 0 && <div>or</div>}
                          {dataRequestEligibility?.claimRequestEligibility
                            ?.claimRequest?.claimType !== ClaimType.EMPTY && (
                            <ShardTag
                              groupMetadata={
                                dataRequestEligibility?.claimRequestEligibility
                                  ?.groupMetadata
                              }
                              claimType={
                                dataRequestEligibility?.claimRequestEligibility
                                  ?.claimRequest?.claimType
                              }
                              requestedValue={
                                dataRequestEligibility?.claimRequestEligibility
                                  ?.claimRequest?.value
                              }
                              onModal={() =>
                                onShardClick(
                                  dataRequestEligibility
                                    ?.claimRequestEligibility?.groupMetadata?.id
                                )
                              }
                            />
                          )}
                          {dataRequestEligibility?.authRequestEligibility
                            ?.authRequest?.authType !== AuthType.EMPTY && (
                            <AuthTag
                              authRequest={
                                dataRequestEligibility?.authRequestEligibility
                                  ?.authRequest
                              }
                            />
                          )}
                        </Fragment>
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
