import styled from "styled-components";
import Avatar from "../../../components/Avatar";
import { getMainMinified } from "../../../utils/getMain";
import { Copy } from "phosphor-react";
import colors from "../../../theme/colors";
import { useNotifications } from "../../../components/Notifications/provider";
import { getMinimalIdentifier } from "../../../utils/getMinimalIdentifier";
import { ImportedAccount } from "../../../libs/vault-client";
import { SismoConnectDataSourceState } from "../../../hooks/vault";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 5px 10px 10px;
  gap: 10px;
  box-sizing: border-box;
`;

const AvatarName = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const CopyWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const AvatarWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 21px;
  height: 21px;
`;

const AccountName = styled.div`
  font-family: ${(props) => props.theme.fonts.medium};
  font-size: 14px;
  line-height: 20px;
  color: ${(props) => props.theme.colors.blue0};
`;

type Props = {
  source?: ImportedAccount;
  dataSource?: SismoConnectDataSourceState;
};

export default function AccountLine({ source, dataSource }: Props) {
  const { notificationAdded } = useNotifications();

  const copy = (identifier: string) => {
    navigator.clipboard.writeText(identifier);
    notificationAdded({
      text: `${getMinimalIdentifier(identifier)} copied in your clipboard!`,
      type: "success",
    });
  };

  return (
    <Container>
      <AvatarName>
        <AvatarWrapper>
          {source && (
            <Avatar account={source} style={{ width: "100%", height: "100%" }} width={21} />
          )}
          {dataSource && (
            <Avatar account={dataSource} style={{ width: "100%", height: "100%" }} width={21} />
          )}
        </AvatarWrapper>

        <AccountName>
          {source && getMainMinified(source)}
          {dataSource && getMinimalIdentifier(dataSource.vaultId)}
          {dataSource && dataSource.state}
        </AccountName>
      </AvatarName>

      <CopyWrapper>
        <Copy
          size={12}
          color={colors.blue0}
          onClick={() => copy(source ? source.identifier : dataSource.vaultId)}
        />
      </CopyWrapper>
    </Container>
  );
}
