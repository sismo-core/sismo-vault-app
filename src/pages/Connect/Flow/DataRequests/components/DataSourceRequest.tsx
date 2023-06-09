import styled from "styled-components";

import { CheckCircle } from "phosphor-react";
import {
  AuthRequest,
  AuthRequestEligibility,
  AuthType,
  SelectedSismoConnectRequest,
} from "../../../../../libs/sismo-connect-provers/sismo-connect-prover-v1";
import colors from "../../../../../theme/colors";
import { getHumanReadableAuthType } from "../../../utils/getHumanReadableAuthType";
import { useCallback, useEffect, useState } from "react";
import Toggle from "../../components/Toggle";
import ImportButton from "../../components/ImportButton";
import {
  EthRounded,
  GithubRounded,
  TwitterRounded,
} from "../../../../../components/SismoReactIcon";
import UserSelector from "../../components/UserSelector";
import { ImportedAccount } from "../../../../../libs/vault-client";
import { useVault } from "../../../../../hooks/vault";
import { useImportAccount } from "../../../../Modals/ImportAccount/provider";
import { AccountType } from "../../../../../libs/sismo-client";

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

type Props = {
  auth: AuthRequest;
  authRequestEligibility?: AuthRequestEligibility;
  selectedSismoConnectRequest: SelectedSismoConnectRequest;
  isInitialOptin: boolean;
  loadingEligible: boolean;
  proofLoading: boolean;
  onUserInput: (
    selectedSismoConnectRequest: SelectedSismoConnectRequest
  ) => void;
};

export function DataSourceRequest({
  auth,
  authRequestEligibility,
  selectedSismoConnectRequest,
  isInitialOptin,
  loadingEligible,
  proofLoading,
  onUserInput,
}: Props) {
  const [isOptIn, setIsOptIn] = useState(isInitialOptin);
  const [initialAccount, setInitialAccount] = useState<ImportedAccount>(null);
  const importAccount = useImportAccount();

  const vault = useVault();

  const isOptional = auth?.isOptional;
  const isEligible = authRequestEligibility?.isEligible && vault?.isConnected;
  const isSelectableByUser = !proofLoading && auth?.isSelectableByUser;
  const humanReadableAuthType = getHumanReadableAuthType(auth?.authType);
  const isLoading = importAccount?.importing ? true : false || loadingEligible;

  function onOptInChange(isOptIn: boolean) {
    const newSelectedSismoConnectRequest = {
      ...selectedSismoConnectRequest,
      selectedAuths: selectedSismoConnectRequest.selectedAuths.map(
        (selectedAuth) => {
          if (selectedAuth.uuid === auth.uuid) {
            return {
              ...selectedAuth,
              isOptIn,
            };
          } else {
            return selectedAuth;
          }
        }
      ),
    };
    onUserInput(newSelectedSismoConnectRequest);
  }

  const onValueChange = useCallback(
    (request: AuthRequestEligibility, selectedValue: number | string) => {
      let newSelectedSismoConnectRequest;

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
      onUserInput(newSelectedSismoConnectRequest);
    },
    [onUserInput, selectedSismoConnectRequest]
  );

  useEffect(() => {
    setIsOptIn(isInitialOptin);
  }, [isInitialOptin]);

  /* ************************************************* */
  /* ********* SET INITIAL SELECTED USER ID ********** */
  /* ************************************************* */

  useEffect(() => {
    if (!isEligible) return;
    if (!vault.importedAccounts) return;
    if (initialAccount) return;

    const _initialAccount = vault.importedAccounts.find(
      (account) =>
        account.identifier?.toLowerCase() ===
        selectedSismoConnectRequest?.selectedAuths
          ?.find((selectedAuth) => selectedAuth.uuid === auth?.uuid)
          ?.selectedUserId?.toLowerCase()
    );
    setInitialAccount(_initialAccount);
  }, [
    auth?.uuid,
    initialAccount,
    isEligible,
    selectedSismoConnectRequest?.selectedAuths,
    vault.importedAccounts,
  ]);

  return (
    <Container>
      <Left>
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
          {auth?.authType !== AuthType.VAULT
            ? isEligible
              ? "Prove ownership"
              : "Prove ownership of"
            : "Share"}
          {isEligible && auth?.authType !== AuthType.VAULT && (
            <UserSelector
              authRequestEligibility={authRequestEligibility}
              isSelectableByUser={isSelectableByUser}
              onAuthChange={onValueChange}
              optIn={true}
              initialAccount={initialAccount}
            />
          )}

          {(!isEligible || auth?.authType === AuthType.VAULT) && (
            <span>
              <Bold>{humanReadableAuthType} </Bold>
              {auth?.authType !== AuthType.VAULT && "account"}
            </span>
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
                    auth?.authType === AuthType.TWITTER
                      ? ["twitter"]
                      : auth?.authType === AuthType.GITHUB
                      ? ["github"]
                      : auth?.authType === AuthType.EVM_ACCOUNT
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
                      {auth?.authType === AuthType.TWITTER ? (
                        <TwitterRounded size={14} color={colors.blue11} />
                      ) : auth?.authType === AuthType.GITHUB ? (
                        <GithubRounded size={14} color={colors.blue11} />
                      ) : auth?.authType === AuthType.EVM_ACCOUNT ? (
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
