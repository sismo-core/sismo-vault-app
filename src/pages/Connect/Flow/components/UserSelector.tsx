import styled, { keyframes } from "styled-components";
import {
  AuthRequestEligibility,
  AuthType,
} from "../../../../libs/sismo-connect-provers/sismo-connect-prover-v1";
import { useEffect, useRef, useState } from "react";
import colors from "../../../../theme/colors";
import {
  EthRounded,
  GithubRounded,
  SismoRounded,
  TelegramRounded,
  TwitterRounded,
} from "../../../../components/SismoReactIcon";
import { ImportedAccount } from "../../../../libs/vault-client";
import { CaretDown, Info } from "phosphor-react";
import useOnClickOutside from "../../../../utils/useClickOutside";
import { getMinimalIdentifier } from "../../../../utils/getMinimalIdentifier";
import { getLargeIdentifier } from "../../../../utils/getLargeIdentifier";
import HoverTooltip from "../../../../components/HoverTooltip";

const OuterContainer = styled.div`
  position: relative;
  flex-grow: 1;
  display: flex;
  align-items: center;
  margin-right: 22px;
  margin-left: 4px;
`;

const Container = styled.div<{ color: string; isSelectableByUser: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;

  height: 24px;
  background: ${(props) => props.theme.colors.blue9};
  border-radius: 4px;
  padding-left: 8px;
  padding-right: 6px;
  box-sizing: border-box;
  font-size: 14px;
  line-height: 20px;
  font-family: ${(props) => props.theme.fonts.medium};
  color: ${(props) => props.color};
  gap: 2px;
  overflow: hidden;
  cursor: ${(props) => (props.isSelectableByUser ? "pointer" : "default")};
`;

export const SkeletonLoading = keyframes`
  from {
    background-position-x: 0%;
  }
  to {
    background-position-x: -200%;
  }
`;

const Skeleton = styled(Container)`
  background: linear-gradient(
    90deg,
    rgba(42, 53, 87, 0.4) 5%,
    rgba(42, 53, 87, 1) 20%,
    rgba(42, 53, 87, 1) 30%,
    rgba(42, 53, 87, 0.4) 50%
  );
  background-size: 200% 100%;
  animation: ${SkeletonLoading};
  animation-duration: 1.5s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  box-sizing: border-box;
  height: 24px;
  box-sizing: border-box;
  cursor: default;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const UserTag = styled.div<{ isSelectableByUser: boolean }>`
  display: flex;
  align-items: center;
  flex-grow: 1;
  gap: 6px;
`;

const UserId = styled.div`
  max-width: 170px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChevronWrapper = styled.div<{ isSelectorOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  transform: ${(props) =>
    !props.isSelectorOpen ? "rotateX(0deg)" : "rotateX(180deg)"};

  /* transition: transform 0.15s ease-in-out; */
`;

const SelectorContainer = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  top: 28px;
  right: 0;
  background-color: ${(props) => props.theme.colors.blue9};
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  z-index: 2;
  padding: 4px 2px;
  width: 280px;
  box-sizing: border-box;
`;

const ItemContainer = styled.div<{ isSelected?: boolean; order: number }>`
  display: flex;
  align-items: center;
  padding: 0px 12px;
  gap: 8px;
  height: 38px;
  order: ${(props) => props.order};
  font-size: 14px;
  line-height: 20px;
  font-family: ${(props) => props.theme.fonts.medium};
  color: ${(props) => props.theme.colors.blue0};
  border-radius: 2px;
  cursor: pointer;

  background: transparent;

  &:hover {
    background-color: ${(props) => props.theme.colors.blue7};
  }

  transition: background 0.15s ease-in-out;
`;

const LogoUserTag = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SelectorIcon = styled.div<{ isSelected: boolean }>`
  border-radius: 50%;
  width: 18px !important;
  height: 18px !important;
  border: ${(props) => (props.isSelected ? "5px" : "3px")} solid
    ${(props) =>
      props.isSelected ? props.theme.colors.blue3 : props.theme.colors.blue6};
  box-sizing: border-box;
  flex-shrink: 0;
`;

const DefaultTag = styled.div`
  padding: 2px 8px;
  gap: 10px;

  //width: 57px;
  height: 22px;
  font-size: 12px;
  line-height: 18px;

  background: ${(props) => props.theme.colors.blue6};
  color: ${(props) => props.theme.colors.blue0};
  border-radius: 20px;
  box-sizing: border-box;
`;

const InfoWrapper = styled.div`
  width: 18px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HoverTooltipStyled = styled(HoverTooltip)`
  position: absolute;
  right: -22px;
`;

type Props = {
  optIn?: boolean;
  isSelectableByUser?: boolean;
  initialAccount?: ImportedAccount;
  authRequestEligibility: AuthRequestEligibility;

  onAuthChange: (
    authRequestEligibility: AuthRequestEligibility,
    selectedUserId: string
  ) => void;
};

export default function UserSelector({
  initialAccount,
  authRequestEligibility,
  isSelectableByUser,
  optIn = true,
  onAuthChange,
}: Props) {
  const color = !optIn ? colors.blue3 : colors.blue0;
  const authType = authRequestEligibility?.auth?.authType;
  const ref = useRef(null);

  useOnClickOutside(ref, () => setIsSelectorOpen(false));

  const [valueSelected, setValueSelected] = useState(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  function onValueChange(
    authRequestEligibility: AuthRequestEligibility,
    value: ImportedAccount
  ) {
    setValueSelected(value);
    onAuthChange(authRequestEligibility, value?.identifier);
  }

  useEffect(() => {
    if (!initialAccount) return;
    setValueSelected(initialAccount);
  }, [initialAccount]);

  function getReadableName(importedAccount: ImportedAccount) {
    let humanReadableUserId = "";
    if (
      authRequestEligibility?.auth?.authType !== AuthType.VAULT &&
      authRequestEligibility?.auth?.authType !== AuthType.EVM_ACCOUNT
    ) {
      humanReadableUserId = importedAccount?.profile?.login;
    } else {
      humanReadableUserId = importedAccount?.ens
        ? importedAccount?.ens?.name
        : getLargeIdentifier(importedAccount?.identifier);
    }

    // if (humanReadableUserId?.length > 15) {
    //   humanReadableUserId = `${humanReadableUserId.slice(0, 10)}...`;
    // }
    return humanReadableUserId;
  }
  function getMinifiedReadableName(importedAccount: ImportedAccount) {
    let humanReadableUserId = "";
    if (
      authRequestEligibility?.auth?.authType !== AuthType.VAULT &&
      authRequestEligibility?.auth?.authType !== AuthType.EVM_ACCOUNT
    ) {
      humanReadableUserId = importedAccount?.profile?.login;
    } else {
      humanReadableUserId = importedAccount?.ens
        ? importedAccount?.ens?.name
        : getMinimalIdentifier(importedAccount?.identifier);
    }

    // if (humanReadableUserId?.length > 15) {
    //   humanReadableUserId = `${humanReadableUserId.slice(0, 10)}...`;
    // }
    return humanReadableUserId;
  }

  const isSelectorOpenable =
    isSelectableByUser && authRequestEligibility?.accounts?.length > 1;

  if (!initialAccount)
    return (
      <OuterContainer>
        <Skeleton color={color} isSelectableByUser={false} onClick={() => {}} />
        {authType === AuthType.VAULT && (
          <HoverTooltipStyled
            text="The User Id is an anonymous identifier that indicates a unique user on a specific app. Sharing your User ID only reveals that you are a unique user and authenticates that you own a Data Vault."
            width={280}
          >
            <InfoWrapper>
              <Info size={18} color={color} />
            </InfoWrapper>
          </HoverTooltipStyled>
        )}
      </OuterContainer>
    );

  return (
    <OuterContainer ref={ref}>
      <Container
        color={color}
        isSelectableByUser={isSelectorOpenable}
        onClick={() => {
          isSelectorOpenable && setIsSelectorOpen(!isSelectorOpen);
        }}
      >
        <UserTag isSelectableByUser={isSelectorOpenable}>
          <Logo>
            {authType === AuthType.TWITTER ? (
              <TwitterRounded size={14} color={color} />
            ) : authType === AuthType.GITHUB ? (
              <GithubRounded size={14} color={color} />
            ) : authType === AuthType.VAULT ? (
              <SismoRounded size={14} color={color} />
            ) : authType === AuthType.TELEGRAM ? (
              <TelegramRounded size={14} color={color} />
            ) : (
              <EthRounded size={14} color={color} />
            )}
          </Logo>
          <UserId>{getReadableName(valueSelected)}</UserId>
        </UserTag>
        {isSelectorOpenable && (
          <ChevronWrapper isSelectorOpen={isSelectorOpen}>
            <CaretDown size={16} color={color} />
          </ChevronWrapper>
        )}
      </Container>

      {isSelectorOpen && (
        <SelectorContainer>
          {authRequestEligibility?.accounts?.map((account, index) => {
            const isSelected =
              valueSelected?.identifier?.toLowerCase() ===
              account?.identifier?.toLowerCase();
            const isDefault =
              account?.identifier?.toLowerCase() ===
              authRequestEligibility?.auth?.userId.toLowerCase();

            return (
              <ItemContainer
                key={
                  authRequestEligibility?.auth?.uuid +
                  account?.identifier +
                  "/selectorUserId"
                }
                order={isDefault ? 1 : 2}
                onClick={() => {
                  onValueChange(authRequestEligibility, account);
                  setIsSelectorOpen(false);
                }}
              >
                <SelectorIcon isSelected={isSelected} />
                <LogoUserTag>
                  <Logo>
                    {authType === AuthType.TWITTER ? (
                      <TwitterRounded size={14} color={color} />
                    ) : authType === AuthType.GITHUB ? (
                      <GithubRounded size={14} color={color} />
                    ) : authType === AuthType.VAULT ? (
                      <SismoRounded size={14} color={color} />
                    ) : authType === AuthType.TELEGRAM ? (
                      <TelegramRounded size={14} color={color} />
                    ) : (
                      <EthRounded size={14} color={color} />
                    )}
                  </Logo>
                  <UserId>{getMinifiedReadableName(account)}</UserId>
                </LogoUserTag>
                {isDefault && <DefaultTag>Default</DefaultTag>}
              </ItemContainer>
            );
          })}
        </SelectorContainer>
      )}
      {authType === AuthType.VAULT && (
        <HoverTooltipStyled
          text="The User Id is an anonymous identifier that indicates a unique user on a specific app. Sharing your User ID only reveals that you are a unique user and authenticates that you own a Data Vault."
          width={280}
        >
          <InfoWrapper>
            <Info size={18} color={color} />
          </InfoWrapper>
        </HoverTooltipStyled>
      )}
    </OuterContainer>
  );
}
