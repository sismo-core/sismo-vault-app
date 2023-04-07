import { useImportAccount } from "../../../../Modals/ImportAccount/provider";
import styled from "styled-components";
import Button from "../../../../../components/Button";
import { Info, ArrowsOutSimple } from "phosphor-react";
import colors from "../../../../../theme/colors";
import HoverTooltip from "../../../../../components/HoverTooltip";
import EligibilityModal from "../../components/EligibilityModal";
import { useState } from "react";
import { Gem } from "../../../../../components/SismoReactIcon";
import { EligibilitySummary } from "./components/EligibilitySummary";
import {
  AuthRequestEligibility,
  GroupMetadataClaimRequestEligibility,
  RequestGroupMetadata,
  SelectedSismoConnectRequest,
  SismoConnectRequest,
} from "../../../../../libs/sismo-client/sismo-connect-prover/sismo-connect-v1";
import { TestComp } from "./components/TestComp";

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
  requestGroupsMetadata: RequestGroupMetadata[];
  groupMetadataClaimRequestEligibilities: GroupMetadataClaimRequestEligibility[];
  authRequestEligibilities: AuthRequestEligibility[];
  selectedSismoConnectRequest: SelectedSismoConnectRequest;
  loadingEligible: boolean;
  onUserInput: (
    selectedSismoConnectRequest: SelectedSismoConnectRequest
  ) => void;
  onNext: () => void;
};

export default function ImportEligibleAccount({
  groupMetadataClaimRequestEligibilities,
  authRequestEligibilities,
  requestGroupsMetadata,
  selectedSismoConnectRequest,
  loadingEligible,
  onUserInput,
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

  const hasRequest =
    groupMetadataClaimRequestEligibilities?.length > 0 ||
    authRequestEligibilities?.length > 0;

  function getIsEligible(
    groupMetadataClaimRequestEligibilities: GroupMetadataClaimRequestEligibility[],
    authRequestEligibilities: AuthRequestEligibility[]
  ) {
    if (groupMetadataClaimRequestEligibilities?.length) {
      for (const groupMetadataClaimRequestEligibility of groupMetadataClaimRequestEligibilities) {
        let isClaimEligible =
          groupMetadataClaimRequestEligibility?.claim?.isOptional === false
            ? groupMetadataClaimRequestEligibility?.isEligible
            : true;

        if (!isClaimEligible) {
          return false;
        }
      }
    }

    if (authRequestEligibilities?.length) {
      for (const authRequestEligibility of authRequestEligibilities) {
        let isAuthEligible =
          authRequestEligibility?.auth?.isOptional === false
            ? authRequestEligibility?.isEligible
            : true;

        if (!isAuthEligible) {
          return false;
        }
      }
    }
    return true;
  }

  let isSismoConnectRequestEligible: boolean = getIsEligible(
    groupMetadataClaimRequestEligibilities,
    authRequestEligibilities
  );

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
          <TestComp
            groupMetadataClaimRequestEligibilities={
              groupMetadataClaimRequestEligibilities
            }
            authRequestEligibilities={authRequestEligibilities}
            selectedSismoConnectRequest={selectedSismoConnectRequest}
            onUserInput={onUserInput}
          />

          {/* <EligibilitySummary
            sismoConnectRequest={sismoConnectRequest}
            requestGroupsMetadata={requestGroupsMetadata}
            groupMetadataDataRequestEligibilities={
              groupMetadataDataRequestEligibilities
            }
          /> */}
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
