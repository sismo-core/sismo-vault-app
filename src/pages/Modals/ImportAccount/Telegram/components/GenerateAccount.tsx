import styled from "styled-components";
import colors from "../../../../../theme/colors";
import { useImportAccount } from "../../provider";
import Icon from "../../../../../components/Icon";
import Button from "../../../../../components/Button";
import { useGenerateRecoveryKey } from "../../../GenerateRecoveryKey/provider";

const Content = styled.div`
  width: calc(312px - 64px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
`;

const Header = styled.div`
  display: flex;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.blue0};
  width: 100%;

  font-size: 14px;
  line-height: 20px;
  text-align: center;
`;

const Purple = styled.span`
  color: #c08aff;
`;

const Points = styled.ul`
  font-size: 14px;
  line-height: 20px;
  padding: 0px 0px 0px 20px;
  margin: 0px;
  color: ${colors.blue0};
`;

const Point = styled.li``;

const Backup = styled.div`
  color: #b1bcf1;
  font-size: 16px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  cursor: pointer;
`;

export interface ImportingAccount {
  isSource: boolean;
  isDestination: boolean;
  isOwner: boolean;
}

type Props = {
  payload?: string;
};

export default function GenerateAccount({ payload }: Props): JSX.Element {
  const importAccount = useImportAccount();
  const generateRecoveryKey = useGenerateRecoveryKey();

  const submit = () => {
    setTimeout(() => importAccount.importTelegram(payload), 300);
    importAccount.close();
  };

  return (
    <Content>
      <Header style={{ marginBottom: 10 }}>
        <Icon name="logoTelegram-fill-white" style={{ width: 50 }} />
        <img src="/assets/import-in-vault.svg" alt="Importing account in the vault" />
        <Icon name="vault-outline-white" style={{ width: 41, marginLeft: 10 }} />
      </Header>
      <Title style={{ marginBottom: 20 }}>
        <p>
          Import your Telegram <br />
          <Purple>as an eligible account</Purple>
        </p>
      </Title>
      <Points style={{ marginBottom: 5 }}>
        <Point>A Telegram account can only be imported into one Vault</Point>
      </Points>
      <Backup style={{ marginBottom: 30 }} onClick={() => generateRecoveryKey.open()}>
        Backup my Vault
        <Icon name="arrowRight-outline-lightBlue" style={{ marginLeft: 5 }} />
      </Backup>
      <Button style={{ width: "100%" }} primary onClick={() => submit()}>
        Import
      </Button>
    </Content>
  );
}
