import { useImportAccount } from "../../../../Modals/ImportAccount/provider";
import styled from "styled-components";
import Button from "../../../../../components/Button";
import { Check, Info, ArrowsOutSimple } from "phosphor-react";
import colors from "../../../../../theme/colors";
import HoverTooltip from "../../../../../components/HoverTooltip";
import { AccountData } from "../../../../../libs/sismo-client/provers/types";
import { useVault } from "../../../../../libs/vault";
import EligibilityModal from "../../components/EligibilityModal";
import { useState } from "react";
import { Gem } from "../../../../../components/SismoReactIcon";
import { RequestGroupMetadata } from "../../../../../libs/sismo-client/zk-connect-prover/zk-connect-v1";
import { EligibilitySummary } from "./components/EligibilitySummary";
import { ZkConnectRequest } from "../../../localTypes";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
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

const HeaderSubtitle = styled.div`
  font-size: 14px;
  line-height: 14px;
  font-family: ${(props) => props.theme.fonts.regular};
  color: ${(props) => props.theme.colors.blue0};
`;

const Summary = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 50px;
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

const TooltipWrapper = styled.div`
  display: flex;
  align-self: flex-end;
  align-items: center;
  justify-content: center;
  gap: 3px;

  font-size: 12px;
  line-height: 18px;

  color: ${(props) => props.theme.colors.blue4};
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
  eligibleAccountData: AccountData;
  requestGroupsMetadata: RequestGroupMetadata[];
  zkConnectRequest: ZkConnectRequest;
  loadingEligible: boolean;
};

export default function ImportEligibleAccount({
  eligibleAccountData,
  requestGroupsMetadata,
  zkConnectRequest,
  loadingEligible,
}: Props) {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const importAccount = useImportAccount();
  const vault = useVault();

  function onImport() {
    importAccount.open({
      importType: "account",
      accountTypes: ["ethereum", "github", "twitter"],
    });
  }

  return (
    <>
      {Boolean(requestGroupsMetadata) && (
        <EligibilityModal
          isOpen={modalIsOpen}
          onClose={() => setModalIsOpen(false)}
          requestGroupsMetadata={requestGroupsMetadata}
          initialGroupId={requestGroupsMetadata[0]?.groupMetadata?.id}
        />
      )}
      <Container>
        {/* {isBannerVisible && (
          <Banner>
            <InfoWrapper>
              <Info size={21.5} weight="thin" />
            </InfoWrapper>
            Your current imported accounts do not meet the requirements to
            generate ZK proof. Consider adding another account.
          </Banner>
        )} */}

        <Summary>
          <HeaderWrapper>
            <ContentHeader>
              <Gem color={colors.blue0} size={19} />
              ZK Proof Generation
            </ContentHeader>

            {Boolean(requestGroupsMetadata) && (
              <HeaderSubtitle>
                Import an eligible account into your Data Vault to verify:
              </HeaderSubtitle>
            )}
          </HeaderWrapper>
          <EligibilitySummary
            zkConnectRequest={zkConnectRequest}
            requestGroupsMetadata={requestGroupsMetadata}
          />
        </Summary>

        <EligibilityLink
          onClick={() => {
            setModalIsOpen(true);
          }}
        >
          Eligibility
          <ArrowWrapper>
            <ArrowsOutSimple size={13.74} color={colors.blue2} />
          </ArrowWrapper>
        </EligibilityLink>

        {Boolean(requestGroupsMetadata) && (
          <CallToAction>
            <TooltipWrapper>
              Why Importing?
              <HoverTooltip
                width={330}
                text={
                  <TooltipContent>
                    <div>
                      Importing an account into your Sismo Vault means signing
                      the two wallet messages necessary to generate ZK proofs
                      and mint ZK Badges.
                    </div>
                    <div>
                      These cryptographic signatures are stored in your
                      encrypted Vault so you don’t have to sign the messages
                      every time you mint a Badge.
                    </div>
                  </TooltipContent>
                }
              >
                <Info size={12} color={colors.blue4} weight="bold" />
              </HoverTooltip>
            </TooltipWrapper>
            <Button
              primary
              style={{ width: 252 }}
              onClick={() => !eligibleAccountData && onImport()}
              loading={importAccount.importing === "account" || loadingEligible}
              disabled={
                importAccount.importing === "account" || loadingEligible
              }
            >
              {loadingEligible ? (
                "Checking..."
              ) : (
                <>
                  {importAccount.importing !== "account"
                    ? `Import eligible account`
                    : `Checking eligibility`}
                </>
              )}
            </Button>
          </CallToAction>
        )}
      </Container>
    </>
  );
}
