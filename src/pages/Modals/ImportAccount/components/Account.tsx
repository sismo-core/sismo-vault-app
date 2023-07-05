import styled from "styled-components";
import colors from "../../../../theme/colors";
import { AccountType } from "../../../../libs/vault-client";
import Icon from "../../../../components/Icon";

const Container = styled.div`
  padding: 20px;
  box-sizing: border-box;
  width: 120px;
  height: 120px;
  background-color: ${colors.blue9};
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease-out;
  :hover {
    transform: scale(1.01);
  }
`;

const AccountText = styled.div`
  text-align: center;
  font-size: 14px;
  line-height: 105%;
  display: flex;
  align-items: center;
  text-align: center;
  color: ${colors.blue0};
`;

const AccountLogo = styled.div`
  height: 40px;
  margin-bottom: 10px;
`;

type Props = {
  type: AccountType;
  onClick: () => void;
};

export default function Account({ type, onClick }: Props): JSX.Element {
  return (
    <Container onClick={() => onClick()}>
      <AccountLogo>
        {type === "ethereum" && (
          <Icon name="logoEthereum-fill-bluem05" style={{ height: "100%" }} />
        )}
        {type === "twitter" && (
          <Icon name="logoTwitter-fill-bluem05" style={{ height: "85%", marginTop: "5px" }} />
        )}
        {type === "github" && <Icon name="logoGithub-fill-bluem05" style={{ height: "100%" }} />}
        {type === "telegram" && (
          <Icon name="logoTelegram-fill-bluem05" style={{ height: "100%" }} />
        )}
        {type === "worldcoin" && <Icon name="worldcoin-outline-white" style={{ height: "100%" }} />}
      </AccountLogo>
      <AccountText>
        {type === "ethereum" && (
          <>
            Ethereum <br />
            account
          </>
        )}
        {type === "twitter" && (
          <>
            Twitter <br />
            account
          </>
        )}
        {type === "github" && (
          <>
            Github <br />
            account
          </>
        )}
        {type === "telegram" && (
          <>
            Telegram <br />
            account
          </>
        )}
        {type === "worldcoin" && (
          <>
            World ID <br />
            account
          </>
        )}
      </AccountText>
    </Container>
  );
}
