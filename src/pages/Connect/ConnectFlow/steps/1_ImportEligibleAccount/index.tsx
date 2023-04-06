import { useImportAccount } from "../../../../Modals/ImportAccount/provider";
import styled from "styled-components";
import Button from "../../../../../components/Button";
import { Info, ArrowsOutSimple } from "phosphor-react";
import colors from "../../../../../theme/colors";
import HoverTooltip from "../../../../../components/HoverTooltip";
import EligibilityModal from "../../components/EligibilityModal";
import { useState } from "react";
import { Gem } from "../../../../../components/SismoReactIcon";
import { RequestGroupMetadata } from "../../../../../libs/sismo-client/zk-connect-prover/zk-connect-v2";
import { EligibilitySummary } from "./components/EligibilitySummary";
import { SismoConnectRequest } from "../../../localTypes";
import {
  GroupMetadataDataRequestEligibility,
  AuthType,
  ClaimType,
} from "../../../../../libs/sismo-client/zk-connect-prover/zk-connect-v2";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  flex-grow: 1;
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

type Props = {
  groupMetadataDataRequestEligibilities: GroupMetadataDataRequestEligibility[];
  requestGroupsMetadata: RequestGroupMetadata[];
  sismoConnectRequest: SismoConnectRequest;
  loadingEligible: boolean;
  onNext: () => void;
};

export default function ImportEligibleAccount({
  groupMetadataDataRequestEligibilities,
  requestGroupsMetadata,
  sismoConnectRequest,
  loadingEligible,
  onNext,
}: Props) {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const importAccount = useImportAccount();

  function onImport() {
    importAccount.open({
      importType: "account",
      accountTypes: ["ethereum", "github", "twitter"],
    });
  }

  const hasRequest = groupMetadataDataRequestEligibilities?.length > 0;

  let isSismoConnectRequestEligible: boolean = true;

  function getIsEligible(
    groupMetadataDataRequestEligibility: GroupMetadataDataRequestEligibility
  ) {
    let isClaimEligible = true;
    let isAuthEligible = true;

    if (
      groupMetadataDataRequestEligibility?.authRequestEligibility?.authRequest
        ?.authType !== AuthType.EMPTY
    ) {
      isAuthEligible = false;
      isAuthEligible = Boolean(
        groupMetadataDataRequestEligibility?.authRequestEligibility?.accounts
          ?.length
      );
    }

    if (
      groupMetadataDataRequestEligibility?.claimRequestEligibility?.claimRequest
        ?.claimType !== ClaimType.EMPTY
    ) {
      isClaimEligible = false;
      isClaimEligible =
        groupMetadataDataRequestEligibility?.claimRequestEligibility
          ?.accountData &&
        Boolean(
          Object?.keys(
            groupMetadataDataRequestEligibility?.claimRequestEligibility
              ?.accountData
          )?.length
        );
    }

    const isEligible = isClaimEligible && isAuthEligible;
    return isEligible;
  }

  // REFACTOR LOGIC
  if (sismoConnectRequest?.requestContent?.operators[0] === "AND") {
    isSismoConnectRequestEligible = groupMetadataDataRequestEligibilities.every(
      (groupMetadataDataRequestEligibility) => {
        return getIsEligible(groupMetadataDataRequestEligibility);
      }
    );
  }

  if (sismoConnectRequest?.requestContent?.operators[0] === "OR") {
    isSismoConnectRequestEligible = groupMetadataDataRequestEligibilities.some(
      (groupMetadataDataRequestEligibility) => {
        return getIsEligible(groupMetadataDataRequestEligibility);
      }
    );
  }

  return (
    <>
      {requestGroupsMetadata?.length > 0 && (
        <EligibilityModal
          isOpen={modalIsOpen}
          onClose={() => setModalIsOpen(false)}
          requestGroupsMetadata={requestGroupsMetadata}
          initialGroupId={requestGroupsMetadata[0]?.groupMetadata?.id}
        />
      )}
      <Container>
        <Summary>
          <HeaderWrapper>
            <ContentHeader>
              <Gem color={colors.blue0} size={19} />
              ZK Proof Generation
            </ContentHeader>

            {hasRequest && (
              <HeaderSubtitle>
                Import an eligible account into your Data Vault to verify:
              </HeaderSubtitle>
            )}
          </HeaderWrapper>
          <EligibilitySummary
            sismoConnectRequest={sismoConnectRequest}
            requestGroupsMetadata={requestGroupsMetadata}
            groupMetadataDataRequestEligibilities={
              groupMetadataDataRequestEligibilities
            }
          />
        </Summary>

        {requestGroupsMetadata?.length > 0 && (
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
        )}

        {hasRequest && (
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
            {!isSismoConnectRequestEligible && (
              <Button
                primary
                style={{ width: 252 }}
                onClick={() => onImport()}
                loading={
                  importAccount.importing === "account" || loadingEligible
                }
                disabled={
                  importAccount.importing === "account" || loadingEligible
                }
              >
                {importAccount.importing !== "account"
                  ? `Import eligible account`
                  : `Checking eligibility`}
              </Button>
            )}
            {isSismoConnectRequestEligible && (
              <Button
                success
                style={{ width: 252 }}
                onClick={() => onNext()}
                loading={
                  importAccount.importing === "account" || loadingEligible
                }
                disabled={
                  importAccount.importing === "account" || loadingEligible
                }
              >
                Generate ZK proof
              </Button>
            )}
          </CallToAction>
        )}
      </Container>
    </>
  );
}
