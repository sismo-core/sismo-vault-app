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
import { useState } from "react";
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

export function DataRequest({
  authRequestEligibility,
  groupMetadataClaimRequestEligibility,
  selectedSismoConnectRequest,
  onUserInput,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOptIn, setIsOptIn] = useState(false);

  const isClaim = !!groupMetadataClaimRequestEligibility;
  const isAuth = !!authRequestEligibility;

  const isInitiallyLoaded = isClaim || isAuth;

  const isOptional =
    authRequestEligibility?.auth?.isOptional ||
    groupMetadataClaimRequestEligibility?.claim?.isOptional;

  const isEligible =
    authRequestEligibility?.isEligible ||
    groupMetadataClaimRequestEligibility?.isEligible;

  console.log(
    "groupMetadataClaimRequestEligibility",
    groupMetadataClaimRequestEligibility
  );
  console.log("isEligible", isEligible);

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
          <CheckCircle
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
              groupMetadata={
                groupMetadataClaimRequestEligibility?.groupMetadata
              }
              claimType={groupMetadataClaimRequestEligibility?.claim?.claimType}
              requestedValue={
                groupMetadataClaimRequestEligibility?.claim?.value
              }
              onModal={() => setIsModalOpen(true)}
            />
          )}
        </TextWrapper>
      </Left>
      <Right>
        {!isEligible && (
          <StyledButton primary verySmall isMedium loading={false}>
            {true && (
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
            )}
          </StyledButton>
        )}
      </Right>
    </Container>
  );
}
