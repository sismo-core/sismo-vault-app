import styled from "styled-components";
import {
  AuthRequestEligibility,
  AuthType,
} from "../../../../libs/sismo-client/sismo-connect-prover/sismo-connect-v1";
import { useEffect, useState } from "react";
import colors from "../../../../theme/colors";
import {
  EthRounded,
  GithubRounded,
  TwitterRounded,
} from "../../../../components/SismoReactIcon";
import { ImportedAccount } from "../../../../libs/vault-client";
import { CaretDown } from "phosphor-react";

const Container = styled.div<{ color: string; isSelectableByUser: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 96px;
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

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const UserTag = styled.div<{ isSelectableByUser: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  width: ${(props) => (props.isSelectableByUser ? "64px" : "100%")};
`;

const UserId = styled.div`
  //width: 56px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChevronWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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

  const [valueSelected, setValueSelected] = useState(initialAccount || null);

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

  let humanReadableUserId = "";

  if (
    authRequestEligibility?.auth?.authType !== AuthType.VAULT &&
    authRequestEligibility?.auth?.authType !== AuthType.EVM_ACCOUNT
  ) {
    humanReadableUserId = valueSelected?.profile?.login;
  } else {
    humanReadableUserId = valueSelected?.ens
      ? valueSelected?.ens?.name
      : valueSelected?.identifier;
  }

  console.log("humanReadableUserId", valueSelected);

  return (
    <Container color={color} isSelectableByUser={isSelectableByUser}>
      <UserTag isSelectableByUser={isSelectableByUser}>
        <Logo>
          {authType === AuthType.TWITTER ? (
            <TwitterRounded size={14} color={color} />
          ) : authType === AuthType.GITHUB ? (
            <GithubRounded size={14} color={color} />
          ) : (
            <EthRounded size={14} color={color} />
          )}
        </Logo>
        <UserId>{humanReadableUserId}</UserId>
      </UserTag>
      {isSelectableByUser && (
        <ChevronWrapper>
          <CaretDown size={16} color={color} />
        </ChevronWrapper>
      )}
    </Container>
  );
}
