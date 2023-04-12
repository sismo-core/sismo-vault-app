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
import Button from "../../../../components/Button";
import ImportButton from "./ImportButton";
import {
  EthRounded,
  GithubRounded,
  Twitter,
  TwitterRounded,
} from "../../../../components/SismoReactIcon";
import UserTag from "./UserTag";
import UserSelector from "./UserSelector";
import { ImportedAccount } from "../../../../libs/vault-client";
import { useVault } from "../../../../libs/vault";

type Props = {
  authRequestEligibility?: AuthRequestEligibility;
  groupMetadataClaimRequestEligibility?: GroupMetadataClaimRequestEligibility;
  selectedSismoConnectRequest: SelectedSismoConnectRequest;
  onUserInput: (
    selectedSismoConnectRequest: SelectedSismoConnectRequest
  ) => void;
};

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

export function DataRequest({
  authRequestEligibility,
  groupMetadataClaimRequestEligibility,
  selectedSismoConnectRequest,
  onUserInput,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOptIn, setIsOptIn] = useState(false);
  const [initialAccount, setInitialAccount] = useState<ImportedAccount>(null);
  const [initialValue, setInitialValue] = useState<number>(null);

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
    authRequestEligibility?.auth?.isSelectableByUser ||
    groupMetadataClaimRequestEligibility?.claim?.isSelectableByUser;

  const humanReadableAuthType = getHumanReadableAuthType(
    authRequestEligibility?.auth?.authType
  );

  const isAuthRequiredNotSelectable =
    !authRequestEligibility?.auth?.isSelectableByUser &&
    authRequestEligibility?.auth?.userId !== "0" &&
    authRequestEligibility?.auth?.authType !== AuthType.VAULT;

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

  const onAuthChange = useCallback(
    (
      authRequestEligibility: AuthRequestEligibility,
      accountIdentifier: string
    ) => {
      const newSelectedSismoConnectRequest = {
        ...selectedSismoConnectRequest,
        selectedAuths: selectedSismoConnectRequest?.selectedAuths?.map(
          (auth) => {
            if (auth.uuid === authRequestEligibility?.auth?.uuid) {
              return {
                ...auth,
                selectedUserId: accountIdentifier,
              };
            } else {
              return auth;
            }
          }
        ),
      };
      onUserInput(newSelectedSismoConnectRequest);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

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

  const onClaimChange = useCallback(
    (
      groupMetadataClaimRequestEligibility: GroupMetadataClaimRequestEligibility,
      selectedValue: number
    ) => {
      const newSelectedSismoConnectRequest = {
        ...selectedSismoConnectRequest,
        selectedClaims: selectedSismoConnectRequest.selectedClaims.map(
          (claim) => {
            if (
              claim.uuid === groupMetadataClaimRequestEligibility.claim.uuid
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  /* ************************************************* */
  /* ********* SET INITIAL SELECTED USER ID ********** */
  /* ************************************************* */

  useEffect(() => {
    if (!isAuth) return;
    if (!isEligible) return;
    if (!vault.isConnected) return;
    if (initialAccount) return;

    if (authRequestEligibility?.auth?.userId === "0") {
      let userId;
      setInitialAccount(authRequestEligibility?.accounts[0]);
      onAuthChange(authRequestEligibility, userId);
    }

    if (authRequestEligibility?.auth?.userId !== "0") {
      const defaultAccount = authRequestEligibility?.accounts.find(
        (account) =>
          account.identifier?.toLowerCase() ===
          authRequestEligibility?.auth?.userId?.toLowerCase()
      );

      if (defaultAccount) {
        setInitialAccount(defaultAccount);
        onAuthChange(authRequestEligibility, defaultAccount.identifier);
      } else {
        setInitialAccount(authRequestEligibility?.accounts[0]);
        onAuthChange(
          authRequestEligibility,
          authRequestEligibility?.accounts[0]?.identifier
        );
      }
    }
  }, [
    authRequestEligibility,
    initialAccount,
    isAuth,
    isEligible,
    onAuthChange,
    vault.isConnected,
  ]);

  /* ************************************************* */
  /* ********* SET INITIAL SELECTED VALUE ************ */
  /* ************************************************* */

  useEffect(() => {
    if (!isClaim) return;
    if (!isEligible) return;
    if (!vault.isConnected) return;
    if (initialValue) return;

    const initialClaimValue =
      groupMetadataClaimRequestEligibility?.claim?.value;
    setInitialValue(initialClaimValue);
    onClaimChange(groupMetadataClaimRequestEligibility, initialClaimValue);
  }, [
    groupMetadataClaimRequestEligibility,
    initialValue,
    isClaim,
    isEligible,
    onClaimChange,
    vault.isConnected,
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
            isDisabled={!isEligible}
            onChange={() => {
              onOptInChange(!isOptIn);
              setIsOptIn(!isOptIn);
            }}
          />
        )}
        <TextWrapper isOptIn={isOptional && isEligible ? isOptIn : true}>
          Share
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
              onClaimChange={onClaimChange}
              initialValue={initialValue}
              onModal={() => setIsModalOpen(true)}
            />
          )}
        </TextWrapper>
      </Left>
      {vault?.importedAccounts && (
        <Right>
          {!isEligible && (
            <StyledButton primary verySmall isMedium loading={false}>
              <InnerButton>
                {authRequestEligibility?.auth?.authType === AuthType.TWITTER ? (
                  <TwitterRounded size={14} color={colors.blue11} />
                ) : authRequestEligibility?.auth?.authType ===
                  AuthType.GITHUB ? (
                  <GithubRounded size={14} color={colors.blue11} />
                ) : (
                  <EthRounded size={14} color={colors.blue11} />
                )}
                <span>Connect</span>
              </InnerButton>
            </StyledButton>
          )}
          {isEligible &&
            isAuth &&
            authRequestEligibility?.auth?.authType !== AuthType.VAULT && (
              <UserSelector
                authRequestEligibility={authRequestEligibility}
                isSelectableByUser={isSelectableByUser}
                onAuthChange={onAuthChange}
                optIn={true}
                initialAccount={initialAccount}
              />
            )}
        </Right>
      )}
    </Container>
  );
}
