import styled from "styled-components";

import { CheckCircle, Info } from "phosphor-react";
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
import UserSelector from "./UserSelector";
import { ImportedAccount } from "../../../../libs/vault-client";
import { useVault } from "../../../../libs/vault";
import { useImportAccount } from "../../../Modals/ImportAccount/provider";
import { AccountType } from "../../../../libs/sismo-client";
import HoverTooltip from "../../../../components/HoverTooltip";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  gap: 38px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 12px;
    padding: 16px 0;
    justify-content: flex-end;
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

const Bold = styled.span`
  font-family: ${(props) => props.theme.fonts.bold};
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

const InfoWrapper = styled.div`
  width: 18px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

type Props = {
  authRequestEligibility?: AuthRequestEligibility;
  groupMetadataClaimRequestEligibility?: GroupMetadataClaimRequestEligibility;
  selectedSismoConnectRequest: SelectedSismoConnectRequest;
  isInitialOptin: boolean;
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
  isInitialOptin,
  loadingEligible,
  proofLoading,
  onUserInput,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOptIn, setIsOptIn] = useState(isInitialOptin);
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
    (authRequestEligibility?.isEligible ||
      groupMetadataClaimRequestEligibility?.isEligible) &&
    vault?.isConnected;

  const isSelectableByUser =
    !proofLoading &&
    (authRequestEligibility?.auth?.isSelectableByUser ||
      groupMetadataClaimRequestEligibility?.claim?.isSelectableByUser);

  const humanReadableAuthType = getHumanReadableAuthType(
    authRequestEligibility?.auth?.authType
  );

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

  useEffect(() => {
    setIsOptIn(isInitialOptin);
  }, [isInitialOptin]);

  /* ************************************************* */
  /* ********* SET INITIAL SELECTED USER ID ********** */
  /* ************************************************* */

  useEffect(() => {
    if (!isAuth) return;
    if (!isEligible) return;
    if (!vault.importedAccounts) return;
    if (initialAccount) return;
    if (!authRequestEligibility?.auth?.uuid) return;
    if (!selectedSismoConnectRequest?.appId) return;
    if (!selectedSismoConnectRequest?.selectedAuths) return;

    async function getInitialAccount() {
      const selectedAuth = selectedSismoConnectRequest?.selectedAuths?.find(
        (auth) => auth.uuid === authRequestEligibility?.auth?.uuid
      );

      let _initialAccount: ImportedAccount = null;
      if (selectedAuth.authType !== AuthType.VAULT) {
        _initialAccount = vault.importedAccounts.find(
          (account) =>
            account.identifier?.toLowerCase() ===
            selectedAuth?.selectedUserId?.toLowerCase()
        );
      }

      if (selectedAuth.authType === AuthType.VAULT) {
        const appId = selectedSismoConnectRequest.appId;
        console.log("appId", appId);

        const vaultId = await vault.getVaultId({ appId });
        _initialAccount = {
          identifier: vaultId,
        } as ImportedAccount;
      }
      setInitialAccount(_initialAccount);
    }

    getInitialAccount();
  }, [
    authRequestEligibility?.auth?.uuid,
    initialAccount,
    isAuth,
    isEligible,
    selectedSismoConnectRequest?.appId,
    selectedSismoConnectRequest?.selectedAuths,
    vault,
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
            ? isEligible
              ? "Prove ownership"
              : "Prove ownership of"
            : "Share"}
          {isAuth && (
            <>
              {isEligible &&
                authRequestEligibility?.auth?.authType !== AuthType.VAULT && (
                  <UserSelector
                    authRequestEligibility={authRequestEligibility}
                    isSelectableByUser={isSelectableByUser}
                    onAuthChange={onValueChange}
                    optIn={true}
                    initialAccount={initialAccount}
                  />
                )}

              {isEligible &&
                authRequestEligibility?.auth?.authType === AuthType.VAULT && (
                  <>
                    <Bold>{humanReadableAuthType} </Bold>
                    <UserSelector
                      authRequestEligibility={authRequestEligibility}
                      isSelectableByUser={false}
                      onAuthChange={() => {}}
                      optIn={true}
                      initialAccount={initialAccount}
                    />
                  </>
                )}

              {!isEligible && (
                <span>
                  <Bold>{humanReadableAuthType} </Bold>
                  {authRequestEligibility?.auth?.authType !== AuthType.VAULT &&
                    "account"}
                </span>
              )}
              {!isEligible &&
                authRequestEligibility?.auth?.authType === AuthType.VAULT && (
                  <HoverTooltip
                    text="The User Id is an anonymous identifier that indicates a unique user on a specific app. Sharing your User ID only reveals that you are a unique user and authenticates that you own a Data Vault."
                    width={280}
                  >
                    <InfoWrapper>
                      <Info size={16} color={colors.blue0} />
                    </InfoWrapper>
                  </HoverTooltip>
                )}
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
              isOptional={isOptional}
            />
          )}
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
                    authRequestEligibility?.auth?.authType === AuthType.TWITTER
                      ? ["twitter"]
                      : authRequestEligibility?.auth?.authType ===
                        AuthType.GITHUB
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
          </>
        )}
      </Right>
    </Container>
  );
}
