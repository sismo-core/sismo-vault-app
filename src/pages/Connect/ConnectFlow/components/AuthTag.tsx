import styled from "styled-components";
import { Auth, AuthType } from "../../localTypes";
//import { ClaimType } from "@sismo-core/zk-connect-client";

const Container = styled.div`
  font-family: ${(props) => props.theme.fonts.medium};
  font-size: 14px;
  line-height: 20px;
  color: ${(props) => props.theme.colors.blue0};
  padding: 2px 8px;
  background: ${(props) => props.theme.colors.blue9};
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

type Props = {
  authRequest: Auth;
};

export default function AuthTag({ authRequest }: Props) {
  const authType = authRequest?.authType;

  const humanReadableType =
    authType === AuthType.EVM_ACCOUNT
      ? "Ethereum account"
      : authType === AuthType.GITHUB
      ? "Github account"
      : authType === AuthType.TWITTER
      ? "Twitter account"
      : authType === AuthType.ANON
      ? "Vault user id"
      : null;

  return <Container>{humanReadableType}</Container>;
}
