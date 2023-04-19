import styled from "styled-components";

import { CheckCircle } from "phosphor-react";
import {
  AuthRequestEligibility,
  AuthType,
  GroupMetadataClaimRequestEligibility,
  SelectedSismoConnectRequest,
} from "../../../../libs/sismo-client/sismo-connect-prover/sismo-connect-v1";
import colors from "../../../../theme/colors";
import { getHumanReadableAuthType } from "../../utils/getHumanReadableAuthType";
import ShardTag from "./ShardTag";
import EligibilityModal from "./EligibilityModal";
import { useCallback, useEffect, useState } from "react";
import Toggle from "./Toggle";
import ImportButton from "./ImportButton";
import {
  EthRounded,
  GithubRounded,
  TwitterRounded,
} from "../../../../components/SismoReactIcon";
import UserTag from "./UserTag";
import UserSelector from "./UserSelector";
import { ImportedAccount } from "../../../../libs/vault-client";
import { useVault } from "../../../../libs/vault";
import { useImportAccount } from "../../../Modals/ImportAccount/provider";
import { AccountType } from "../../../../libs/sismo-client";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  font-size: 14px;
  line-height: 20px;
  font-family: ${(props) => props.theme.fonts.regular};
`;

const TextWrapper = styled.div<{ isOptIn: boolean }>`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  color: ${(props) =>
    props.isOptIn ? props.theme.colors.blue0 : props.theme.colors.blue3};
`;

const Bold = styled.span`
  font-family: ${(props) => props.theme.fonts.bold};
`;

const Right = styled.div`
  display: flex;
  align-items: center;
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
  authRequestEligibility?: AuthRequestEligibility;
  groupMetadataClaimRequestEligibility?: GroupMetadataClaimRequestEligibility;
  selectedSismoConnectRequest: SelectedSismoConnectRequest;
  loadingEligible: boolean;
  proofLoading: boolean;
  onUserInput: (
    selectedSismoConnectRequest: SelectedSismoConnectRequest
  ) => void;
};

export function DataRequest({
  authRequestEligibility,
  groupMetadataClaimRequestEligibility,
  selectedSismoConnectRequest,
  loadingEligible,
  proofLoading,
  onUserInput,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOptIn, setIsOptIn] = useState(false);
  const [initialAccount, setInitialAccount] = useState<ImportedAccount>(null);
  const [initialValue, setInitialValue] = useState<number>(null);
  const importAccount = useImportAccount();
  // const [buttonNullifier, setButtonNullifier] = useState(null);

  // const [importTentative, setImportTentative] = useState(false);

  const vault = useVault();

  const isClaim = !!groupMetadataClaimRequestEligibility;
  const isAuth = !!authRequestEligibility;

  const isInitiallyLoaded = isClaim || isAuth;

  const isOptional =
    authRequestEligibility?.auth?.isOptional ||
    groupMetadataClaimRequestEligibility?.claim?.isOptional;

  const isEligible =
    authRequestEligibility?.isEligible ||
    groupMetadataClaimRequestEligibility?.isEligible;

  const isSelectableByUser =
    !proofLoading &&
    (authRequestEligibility?.auth?.isSelectableByUser ||
      groupMetadataClaimRequestEligibility?.claim?.isSelectableByUser);

  const humanReadableAuthType = getHumanReadableAuthType(
    authRequestEligibility?.auth?.authType
  );

  const isAuthRequiredNotSelectable =
    !authRequestEligibility?.auth?.isSelectableByUser &&
    authRequestEligibility?.auth?.userId !== "0" &&
    authRequestEligibility?.auth?.authType !== AuthType.VAULT;

  const isLoading = importAccount?.importing ? true : false || loadingEligible;

  function onOptInChange(isOptIn: boolean) {
    if (isClaim) {
      onClaimOptInChange(groupMetadataClaimRequestEligibility!, isOptIn);
    }

    if (isAuth) {
      onAuthOptInChange(authRequestEligibility!, isOptIn);
    }
  }

  function onAuthOptInChange(
    authRequestEligibility: AuthRequestEligibility,
    isOptIn: boolean
  ) {
    const newSelectedSismoConnectRequest = {
      ...selectedSismoConnectRequest,
      selectedAuths: selectedSismoConnectRequest.selectedAuths.map((auth) => {
        if (auth.uuid === authRequestEligibility.auth.uuid) {
          return {
            ...auth,
            isOptIn,
          };
        } else {
          return auth;
        }
      }),
    };
    onUserInput(newSelectedSismoConnectRequest);
  }

  function onClaimOptInChange(
    groupMetadataClaimRequestEligibility: GroupMetadataClaimRequestEligibility,
    isOptIn: boolean
  ) {
    const newSelectedSismoConnectRequest = {
      ...selectedSismoConnectRequest,
      selectedClaims: selectedSismoConnectRequest.selectedClaims.map(
        (claim) => {
          if (claim.uuid === groupMetadataClaimRequestEligibility.claim.uuid) {
            return {
              ...claim,
              isOptIn,
            };
          } else {
            return claim;
          }
        }
      ),
    };
    onUserInput(newSelectedSismoConnectRequest);
  }

  const onValueChange = useCallback(
    (
      request: GroupMetadataClaimRequestEligibility | AuthRequestEligibility,
      selectedValue: number | string
    ) => {
      let newSelectedSismoConnectRequest;

      if (isAuth) {
        newSelectedSismoConnectRequest = {
          ...selectedSismoConnectRequest,
          selectedAuths: selectedSismoConnectRequest?.selectedAuths?.map(
            (auth) => {
              if (
                auth?.uuid === (request as AuthRequestEligibility)?.auth?.uuid
              ) {
                return {
                  ...auth,
                  selectedUserId: selectedValue,
                };
              } else {
                return auth;
              }
            }
          ),
        };
      }

      if (isClaim) {
        newSelectedSismoConnectRequest = {
          ...selectedSismoConnectRequest,
          selectedClaims: selectedSismoConnectRequest.selectedClaims.map(
            (claim) => {
              if (
                claim.uuid ===
                (request as GroupMetadataClaimRequestEligibility)?.claim?.uuid
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
      }
      onUserInput(newSelectedSismoConnectRequest);
    },
    [isAuth, isClaim, onUserInput, selectedSismoConnectRequest]
  );

  /* ************************************************* */
  /* ********* SET INITIAL SELECTED USER ID ********** */
  /* ************************************************* */

  useEffect(() => {
    if (!isAuth) return;
    if (!isEligible) return;
    if (!vault.importedAccounts) return;
    if (initialAccount) return;

    const _initialAccount = vault.importedAccounts.find(
      (account) =>
        account.identifier?.toLowerCase() ===
        selectedSismoConnectRequest?.selectedAuths
          ?.find((auth) => auth.uuid === authRequestEligibility?.auth?.uuid)
          ?.selectedUserId?.toLowerCase()
    );
    setInitialAccount(_initialAccount);
  }, [
    authRequestEligibility?.auth?.uuid,
    initialAccount,
    isAuth,
    isEligible,
    selectedSismoConnectRequest?.selectedAuths,
    vault.importedAccounts,
  ]);

  // /* ************************************************* */
  // /* ********* SET INITIAL SELECTED VALUE ************ */
  // /* ************************************************* */

  useEffect(() => {
    if (!isClaim) return;
    if (!isEligible) return;
    if (!vault.importedAccounts) return;
    if (initialValue) return;

    const initialClaimValue = selectedSismoConnectRequest?.selectedClaims?.find(
      (claim) =>
        claim?.uuid === groupMetadataClaimRequestEligibility?.claim?.uuid
    )?.selectedValue;

    setInitialValue(initialClaimValue);
  }, [
    groupMetadataClaimRequestEligibility?.claim?.uuid,
    initialValue,
    isClaim,
    isEligible,
    selectedSismoConnectRequest?.selectedClaims,
    vault.importedAccounts,
  ]);

  if (!isInitiallyLoaded) {
    return null;
  }

  return (
    <Container>
      <Left>
        {isClaim && (
          <EligibilityModal
            groupMetadata={groupMetadataClaimRequestEligibility?.groupMetadata}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}

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
          {isAuth && authRequestEligibility?.auth?.authType !== AuthType.VAULT
            ? "Prove ownership of"
            : "Share"}
          {isAuth && (
            <>
              {isAuthRequiredNotSelectable && (
                <UserTag
                  optIn={isOptional && isEligible ? isOptIn : true}
                  userId={authRequestEligibility?.auth?.userId}
                  authType={authRequestEligibility?.auth?.authType}
                />
              )}
              <span>
                <Bold>{humanReadableAuthType} </Bold>
                {authRequestEligibility?.auth?.authType !== AuthType.VAULT &&
                  "account"}
              </span>
            </>
          )}
          {isClaim && (
            <ShardTag
              groupMetadataClaimRequestEligibility={
                groupMetadataClaimRequestEligibility
              }
              isSelectableByUser={isSelectableByUser}
              optIn={isOptional && isEligible ? isOptIn : true}
              onClaimChange={onValueChange}
              initialValue={initialValue}
              onModal={() => setIsModalOpen(true)}
            />
          )}
        </TextWrapper>
      </Left>
      {vault?.importedAccounts && (
        <Right>
          {!isEligible && (
            <StyledButton
              primary
              verySmall
              isMedium
              loading={isLoading}
              onClick={() => {
                const accountTypes: AccountType[] =
                  authRequestEligibility?.auth?.authType === AuthType.TWITTER
                    ? ["twitter"]
                    : authRequestEligibility?.auth?.authType === AuthType.GITHUB
                    ? ["github"]
                    : authRequestEligibility?.auth?.authType ===
                      AuthType.EVM_ACCOUNT
                    ? ["ethereum"]
                    : ["twitter", "github", "ethereum"];
                importAccount.open({
                  importType: "account",
                  accountTypes,
                });
              }}
            >
              <InnerButton>
                {!isLoading && (
                  <>
                    {authRequestEligibility?.auth?.authType ===
                    AuthType.TWITTER ? (
                      <TwitterRounded size={14} color={colors.blue11} />
                    ) : authRequestEligibility?.auth?.authType ===
                      AuthType.GITHUB ? (
                      <GithubRounded size={14} color={colors.blue11} />
                    ) : authRequestEligibility?.auth?.authType ===
                      AuthType.EVM_ACCOUNT ? (
                      <EthRounded size={14} color={colors.blue11} />
                    ) : (
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
                    )}
                    <span>Connect</span>
                  </>
                )}
              </InnerButton>
            </StyledButton>
          )}
          {isEligible &&
            !isAuthRequiredNotSelectable &&
            authRequestEligibility?.auth?.authType !== AuthType.VAULT && (
              <UserSelector
                authRequestEligibility={authRequestEligibility}
                isSelectableByUser={isSelectableByUser}
                onAuthChange={onValueChange}
                optIn={true}
                initialAccount={initialAccount}
              />
            )}
        </Right>
      )}
    </Container>
  );
}
