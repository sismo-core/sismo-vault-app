import styled from "styled-components";
import { useState } from "react";
import Button from "../../../../components/Button";
import { ArrowRight } from "phosphor-react";
import { useWallet } from "../../../../hooks/wallet";

const Container = styled.div`
  width: 320px;
  height: 213.22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 30px;
  box-sizing: border-box;

  color: ${(props) => props.theme.colors.blue0};

  @media (max-width: 800px) {
    width: 315px;
  }
`;

const Top = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.div`
  align-self: flex-start;
  font-size: 20px;
  line-height: 30px;

  margin-bottom: 40px;
  font-family: ${(props) => props.theme.fonts.medium};
`;

const BackupAccess = styled.div`
  align-self: flex-end;
  display: flex;
  align-items: center;
  gap: 5px;

  font-size: 14px;
  line-height: 20px;
  color: ${(props) => props.theme.colors.blue0};
  font-family: ${(props) => props.theme.fonts.medium};
  cursor: pointer;
`;

const Bottom = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

type Props = {
  onConnected: () => void;
  onWalletOnboard: (_loading: boolean) => void;
  onRecoveryKey: () => void;
};

export default function ConnectWalletStep({
  onConnected,
  onWalletOnboard,
  onRecoveryKey,
}: Props): JSX.Element {
  const [connectLoading, setConnectLoading] = useState(false);
  const wallet = useWallet();

  const onConnectHandler = async () => {
    onWalletOnboard(true);
    setConnectLoading(true);
    const connectedWallet = await wallet.connect({});
    if (connectedWallet) {
      // Add small delay in order to wait the onboard modal closing
      setTimeout(() => {
        onWalletOnboard(false);
      }, 300);
      onConnected();
      setConnectLoading(false);

      return;
    }
    onWalletOnboard(false);
    setConnectLoading(false);
  };

  return (
    <Container>
      <Top>
        <Title>Connect to Vault Owner</Title>
      </Top>
      <Bottom>
        <Button
          style={{
            marginBottom: 10,
            width: "100%",
          }}
          onClick={() => onConnectHandler()}
          primary
          loading={connectLoading}
        >
          {connectLoading ? "Connecting..." : "Connect Wallet"}
        </Button>
        <BackupAccess onClick={() => onRecoveryKey()}>
          Use Recovery Key
          <ArrowRight size={21.22} />
        </BackupAccess>
      </Bottom>
    </Container>
  );
}
