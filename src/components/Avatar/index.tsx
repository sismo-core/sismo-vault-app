import styled from "styled-components";
import Blockies from "react-blockies";
import { ImportedAccount, Owner } from "../../services/vault-client";
import Icon from "../Icon";
import { Account } from "../../libs/sismo-client";

const Container = styled.div<{ width: number }>`
  min-height: ${(props) => props.width}px;
  width: ${(props) => props.width}px;
  border-radius: ${(props) => props.width}px;
  overflow: hidden;
  display: flex;
  justify-content: center;
`;

const OwnerKeyContainer = styled.div`
  position: absolute;
`;

const OwnerKey = styled.div`
  position: absolute;
  bottom: -40px;
  left: -25px;
`;

type Props = {
  account?: ImportedAccount | Owner | Account;
  style?: React.CSSProperties;
  width?: 16 | 21 | 22 | 22.8 | 24 | 26 | 27 | 32;
  isOwner?: boolean;
};

export default function Avatar({ account, style, width, isOwner }: Props): JSX.Element {
  const scale =
    width === 16
      ? 2
      : width === 21
      ? 2.8
      : width === 22
      ? 2.5
      : width === 22.8
      ? 2.85
      : width === 24
      ? 3
      : width === 26
      ? 3.25
      : width === 27
      ? 3.5
      : width === 32
      ? 4
      : 3;

  return (
    <Container style={style} width={width ? width : 24}>
      {(account as ImportedAccount)?.type === "ethereum" && account && account.identifier && (
        <Blockies seed={account.identifier} size={8} scale={scale} />
      )}
      {(account as ImportedAccount)?.type === "github" && (
        <Icon name="logoGithub-fill-blue0" style={{ width: "100%", height: "100%" }} />
      )}
      {(account as ImportedAccount)?.type === "twitter" && (
        <Icon name="logoTwitter-rounded-blue0" style={{ width: "100%", height: "100%" }} />
      )}
      {(account as ImportedAccount)?.type === "telegram" && (
        <Icon name="logoTelegram-rounded-blue0" style={{ width: "100%", height: "100%" }} />
      )}
      {!(account as ImportedAccount)?.type && account && account.identifier && (
        <Blockies seed={account.identifier} size={8} scale={scale} />
      )}

      {isOwner && (
        <OwnerKeyContainer>
          <OwnerKey>
            <Icon name="key-fill-blue" />
          </OwnerKey>
        </OwnerKeyContainer>
      )}
    </Container>
  );
}
