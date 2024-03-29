import { goToTelegramAuth } from "../../../../../utils/navigateOAuth";
import styled from "styled-components";
import colors from "../../../../../theme/colors";
import Icon from "../../../../../components/Icon";

const Content = styled.div`
  width: calc(330px - 60px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 30px;
`;

const TelegramButton = styled.div`
  background-color: #2a3557;
  border-radius: 5px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: ${colors.blue0};
  width: 250px;
  cursor: pointer;
`;

const Text = styled.p`
  margin-bottom: 30px;
  color: ${colors.blue0};
  width: 100%;
  text-align: center;
  font-size: 14px;
`;

const Success = styled.span`
  color: ${colors.success};
`;

export default function ConnectTelegram(): JSX.Element {
  return (
    <Content>
      <Text>
        <Success>No link</Success> will be created <Success>between</Success>{" "}
        your{" "}
        <Success>
          Telegram account and the other <br />
          accounts
        </Success>{" "}
        in your Vault
      </Text>
      <TelegramButton onClick={() => goToTelegramAuth()}>
        <Icon name="logoTelegram-fill-white" />
        Continue with Telegram
      </TelegramButton>
    </Content>
  );
}
