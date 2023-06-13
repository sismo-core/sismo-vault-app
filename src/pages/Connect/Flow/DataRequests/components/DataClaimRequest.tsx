import styled from "styled-components";

import { CheckCircle } from "phosphor-react";
import {
  ClaimRequest,
  ClaimRequestEligibility,
  SelectedSismoConnectRequest,
} from "../../../../../libs/sismo-connect-provers/sismo-connect-prover-v1";
import colors from "../../../../../theme/colors";
import ShardTag from "../../components/ShardTag";
import EligibilityModal from "../../components/EligibilityModal";
import { useCallback, useEffect, useState } from "react";
import Toggle from "../../components/Toggle";
import ImportButton from "../../components/ImportButton";
import { useVault } from "../../../../../hooks/vault";
import { useImportAccount } from "../../../../Modals/ImportAccount/provider";
import { AccountType, GroupMetadata } from "../../../../../libs/sismo-client";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  gap: 38px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 0px;
    padding: 16px 0;
    justify-content: flex-end;
    min-height: 0px;
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-grow: 1;
  width: 402.2px;
  font-size: 14px;
  line-height: 20px;
  font-family: ${(props) => props.theme.fonts.regular};
`;

const TextWrapper = styled.div<{ isOptIn: boolean }>`
  display: flex;
  align-items: center;

  white-space: nowrap;
  flex-grow: 1;
  gap: 4px;
  color: ${(props) =>
    props.isOptIn ? props.theme.colors.blue0 : props.theme.colors.blue3};

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  width: 96px;
  flex-shrink: 0;
`;

const StyledButton = styled(ImportButton)`
  height: 28px;
  width: 96px;
  font-size: 12px;
`;

const InnerButton = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CheckCircleIcon = styled(CheckCircle)`
  flex-shrink: 0;
`;

type Props = {
  groupMetadata: GroupMetadata;
  claim: ClaimRequest;
  claimRequestEligibility: ClaimRequestEligibility;
  selectedSismoConnectRequest: SelectedSismoConnectRequest;
  isInitialOptin: boolean;
  loadingEligible: boolean;
  proofLoading: boolean;
  onUserInput: (
    selectedSismoConnectRequest: SelectedSismoConnectRequest
  ) => void;
};

export function DataClaimRequest({
  groupMetadata,
  claim,
  claimRequestEligibility,
  selectedSismoConnectRequest,
  isInitialOptin,
  loadingEligible,
  proofLoading,
  onUserInput,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOptIn, setIsOptIn] = useState(isInitialOptin);
  const [initialValue, setInitialValue] = useState<number>(null);
  const importAccount = useImportAccount();

  const vault = useVault();

  const isOptional = claim?.isOptional;

  const isEligible = claimRequestEligibility?.isEligible && vault?.isConnected;
  const isSelectableByUser = !proofLoading && claim?.isSelectableByUser;
  const isLoading = importAccount?.importing
    ? true
    : false ||
      loadingEligible ||
      typeof claimRequestEligibility === "undefined";

  function onOptInChange(isOptIn: boolean) {
    const newSelectedSismoConnectRequest = {
      ...selectedSismoConnectRequest,
      selectedClaims: selectedSismoConnectRequest.selectedClaims.map(
        (selectedClaim) => {
          if (selectedClaim.uuid === claim.uuid) {
            return {
              ...selectedClaim,
              isOptIn,
            };
          } else {
            return selectedClaim;
          }
        }
      ),
    };
    onUserInput(newSelectedSismoConnectRequest);
  }

  const onValueChange = useCallback(
    (request: ClaimRequestEligibility, selectedValue: number | string) => {
      let newSelectedSismoConnectRequest;

      newSelectedSismoConnectRequest = {
        ...selectedSismoConnectRequest,
        selectedClaims: selectedSismoConnectRequest.selectedClaims.map(
          (claim) => {
            if (
              claim.uuid === (request as ClaimRequestEligibility)?.claim?.uuid
            ) {
              return {
                ...claim,
                selectedValue,
              };
            } else {
              return claim;
            }
          }
        ),
      };
      onUserInput(newSelectedSismoConnectRequest);
    },
    [onUserInput, selectedSismoConnectRequest]
  );

  useEffect(() => {
    setIsOptIn(isInitialOptin);
  }, [isInitialOptin]);

  // /* ************************************************* */
  // /* ********* SET INITIAL SELECTED VALUE ************ */
  // /* ************************************************* */

  useEffect(() => {
    if (!isEligible) return;
    if (!vault.importedAccounts) return;
    if (initialValue) return;

    const initialClaimValue = selectedSismoConnectRequest?.selectedClaims?.find(
      (selectedClaim) => selectedClaim?.uuid === claim?.uuid
    )?.selectedValue;

    setInitialValue(initialClaimValue);
  }, [
    claim?.uuid,
    initialValue,
    isEligible,
    selectedSismoConnectRequest?.selectedClaims,
    vault.importedAccounts,
  ]);

  return (
    <Container>
      <Left>
        <EligibilityModal
          groupMetadata={groupMetadata}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        {!isOptional && (
          <CheckCircleIcon
            size={24}
            color={isEligible ? colors.green1 : colors.blue6}
          />
        )}
        {isOptional && (
          <Toggle
            value={isOptIn}
            isDisabled={!isEligible || proofLoading}
            onChange={() => {
              onOptInChange(!isOptIn);
              setIsOptIn(!isOptIn);
            }}
          />
        )}
        <TextWrapper isOptIn={isOptional && isEligible ? isOptIn : true}>
          <ShardTag
            groupMetadata={groupMetadata}
            claim={claim}
            claimRequestEligibility={claimRequestEligibility}
            isSelectableByUser={isSelectableByUser}
            optIn={isOptional && isEligible ? isOptIn : true}
            onClaimChange={onValueChange}
            initialValue={initialValue}
            onModal={() => setIsModalOpen(true)}
            isOptional={isOptional}
          />
        </TextWrapper>
      </Left>
      <Right>
        {vault?.importedAccounts && (
          <>
            {!isEligible && (
              <StyledButton
                primary
                verySmall
                isMedium
                loading={isLoading}
                onClick={() => {
                  const accountTypes: AccountType[] =
                    groupMetadata.accountTypes;
                  importAccount.open({
                    importType: "account",
                    accountTypes,
                  });
                }}
              >
                <InnerButton>
                  {!isLoading && (
                    <>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="7"
                          cy="7"
                          r="5.5"
                          stroke="#13203D"
                          strokeWidth="3"
                        />
                      </svg>
                      <span>Connect</span>
                    </>
                  )}
                </InnerButton>
              </StyledButton>
            )}
          </>
        )}
      </Right>
    </Container>
  );
}
