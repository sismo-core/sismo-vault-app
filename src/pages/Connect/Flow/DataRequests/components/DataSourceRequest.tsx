import styled from "styled-components";

import { CheckCircle } from "phosphor-react";
import {
  AuthRequest,
  AuthRequestEligibility,
  AuthType,
  SelectedSismoConnectRequest,
} from "../../../../../libs/sismo-connect-provers/sismo-connect-prover-v1";
import colors from "../../../../../theme/colors";
import { useCallback, useEffect, useState } from "react";
import Toggle from "../../components/Toggle";
import ImportButton from "../../components/ImportButton";
import {
  EthRounded,
  GithubRounded,
  TelegramRounded,
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
  gap: 19px;
  //width: 469px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 0px;
    padding: 16px 0;
    justify-content: flex-end;
    min-height: 0px;
    width: 100%;
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-grow: 1;
  font-size: 14px;
  line-height: 20px;
  font-family: ${(props) => props.theme.fonts.regular};
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const TextWrapper = styled.div<{ isOptIn: boolean }>`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
  flex-grow: 1;
  gap: 4px;
  color: ${(props) => (props.isOptIn ? props.theme.colors.blue0 : props.theme.colors.blue3)};
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  width: 96px;
  flex-shrink: 0;
  @media (max-width: 768px) {
    padding-left: 16px;
  }
`;

const StyledButton = styled(ImportButton)`
  height: 28px;
  width: 96px;
  font-size: 12px;
  @media (max-width: 768px) {
    margin-top: 12px;
  }
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
  appId: string;
  isImpersonating: boolean;
  authRequestEligibility?: AuthRequestEligibility;
  selectedSismoConnectRequest: SelectedSismoConnectRequest;
  isInitialOptin: boolean;
  loadingEligible: boolean;
  proofLoading: boolean;
  onUserInput: (selectedSismoConnectRequest: SelectedSismoConnectRequest) => void;
};

export function DataSourceRequest({
  auth,
  appId,
  isImpersonating,
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
  const isLoading = importAccount?.importing
    ? true
    : false || loadingEligible || typeof authRequestEligibility === "undefined";

  const isWeb2Impersonating =
    isImpersonating &&
    (auth?.authType === AuthType.TELEGRAM ||
      auth?.authType === AuthType.TWITTER ||
      auth?.authType === AuthType.GITHUB);

  function onOptInChange(isOptIn: boolean) {
    const newSelectedSismoConnectRequest = {
      ...selectedSismoConnectRequest,
      selectedAuths: selectedSismoConnectRequest.selectedAuths.map((selectedAuth) => {
        if (selectedAuth.uuid === auth.uuid) {
          return {
            ...selectedAuth,
            isOptIn,
          };
        } else {
          return selectedAuth;
        }
      }),
    };
    onUserInput(newSelectedSismoConnectRequest);
  }

  const onValueChange = useCallback(
    (request: AuthRequestEligibility, selectedValue: number | string) => {
      let newSelectedSismoConnectRequest;

      newSelectedSismoConnectRequest = {
        ...selectedSismoConnectRequest,
        selectedAuths: selectedSismoConnectRequest?.selectedAuths?.map((auth) => {
          if (auth?.uuid === (request as AuthRequestEligibility)?.auth?.uuid) {
            return {
              ...auth,
              selectedUserId: selectedValue,
            };
          } else {
            return auth;
          }
        }),
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
    async function getInitialAccount() {
      let _initialAccount: ImportedAccount = null;
      if (auth.authType === AuthType.VAULT) {
        const vaultId = await vault.getVaultId({ appId });
        _initialAccount = {
          identifier: vaultId,
        } as ImportedAccount;
        setInitialAccount(_initialAccount);
        return;
      }

      if (!authRequestEligibility?.auth?.uuid) return;
      if (!selectedSismoConnectRequest) return;
      const selectedAuth = selectedSismoConnectRequest?.selectedAuths?.find(
        (auth) => auth.uuid === authRequestEligibility?.auth?.uuid
      );
      _initialAccount = vault.importedAccounts.find(
        (account) =>
          account.identifier?.toLowerCase() === selectedAuth?.selectedUserId?.toLowerCase()
      );
      setInitialAccount(_initialAccount);
    }
    getInitialAccount();
  }, [
    appId,
    auth?.authType,
    authRequestEligibility?.auth?.uuid,
    initialAccount,
    isEligible,
    selectedSismoConnectRequest,
    vault,
    vault?.importedAccounts,
  ]);

  return (
    <Container>
      <Left>
        {!isOptional && (
          <CheckCircleIcon size={24} color={isEligible ? colors.green1 : colors.blue6} />
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
          Ownership
          <UserSelector
            auth={auth}
            authRequestEligibility={authRequestEligibility}
            isSelectableByUser={isSelectableByUser}
            onAuthChange={onValueChange}
            optIn={true}
            initialAccount={initialAccount}
            isLoading={vault.isConnected && isLoading}
            isEligible={isEligible}
          />
        </TextWrapper>
      </Left>
      <Right>
        {vault?.importedAccounts && (
          <>
            {!isEligible && auth?.authType !== AuthType.VAULT && !isWeb2Impersonating && (
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
                      : auth?.authType === AuthType.TELEGRAM
                      ? ["telegram"]
                      : ["twitter", "github", "ethereum", "telegram"];
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
                      ) : auth?.authType === AuthType.TELEGRAM ? (
                        <TelegramRounded size={14} color={colors.blue11} />
                      ) : (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="7" cy="7" r="5.5" stroke="#13203D" strokeWidth="3" />
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
