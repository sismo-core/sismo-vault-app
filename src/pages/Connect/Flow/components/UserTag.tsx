import styled from "styled-components";
import colors from "../../../../theme/colors";
import { AuthType } from "../../../../libs/sismo-connect-provers/sismo-connect-prover-v1";
import { EthRounded, GithubRounded, TwitterRounded } from "../../../../components/SismoReactIcon";
import { useMainMinified } from "../../../../hooks/wallet/hooks/useMainMinified";
import { resolveSismoIdentifier } from "../../utils/resolveSismoIdentifier";

const Container = styled.div<{ optIn: boolean }>`
  font-family: ${(props) => props.theme.fonts.medium};
  font-size: 14px;
  line-height: 20px;
  color: ${(props) => (!props.optIn ? props.theme.colors.blue3 : props.theme.colors.blue0)};
  padding: 2px 8px;
  background: ${(props) => props.theme.colors.blue9};
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

type Props = {
  authType: AuthType;
  userId: string;
  optIn?: boolean;
};

export default function UserTag({ authType, userId, optIn = false }: Props) {
  const color = !optIn ? colors.blue3 : colors.blue0;

  let humanReadableUser: string = userId;
  const { mainMinified } = useMainMinified(userId);

  if (authType === AuthType.EVM_ACCOUNT) {
    humanReadableUser = mainMinified?.toLowerCase();
  } else {
    humanReadableUser = resolveSismoIdentifier(userId, authType);
  }

  return (
    <Container optIn={optIn}>
      {authType === AuthType.TWITTER ? (
        <TwitterRounded size={14} color={color} />
      ) : authType === AuthType.GITHUB ? (
        <GithubRounded size={14} color={color} />
      ) : (
        <EthRounded size={14} color={color} />
      )}
      <span>{humanReadableUser}</span>
    </Container>
  );
}
