import { useEffect, useState } from "react";
import styled from "styled-components";
import Modal from "../../../components/Modal";
import Button from "../../../components/Button";
import env from "../../../environment";
import { useWallet } from "../../../libs/wallet";

const Title = styled.div`
  width: 100%;
  font-family: ${(props) => props.theme.fonts.medium};
  font-size: 20px;
  text-align: left;
  color: white;
`;

const Text = styled.div`
  font-family: ${(props) => props.theme.fonts.medium};
  font-size: 14px;
  width: 100%;
  text-align: left;
  color: #e9ecff;
`;

const Content = styled.div`
  width: calc(350px - 64px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 32px;
`;

type NetworkModalProps = {
  supportedChainIds: number[];
  isOpen: boolean;
  onClose: () => void;
};

//NOT anymore used
export default function NetworkModal({
  supportedChainIds,
  isOpen,
  onClose,
}: NetworkModalProps): JSX.Element {
  const [loading, setLoading] = useState(false);
  const wallet = useWallet();

  useEffect(() => {
    if (
      wallet.chainId &&
      supportedChainIds &&
      supportedChainIds.includes(wallet.chainId)
    ) {
      onClose();
    }
  }, [wallet.chainId, supportedChainIds, onClose]);

  const switchNetwork = async () => {
    setLoading(true);
    await wallet.setChain(env.chainIds[0]);
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      blur={loading}
      animated
      zIndex={3000}
      outsideClosable={false}
    >
      <Content>
        <Title style={{ marginBottom: 10 }}>Network not supported</Title>
        <Text style={{ marginBottom: 30 }}>
          Please switch to a supported network
        </Text>
        <Button style={{ width: "100%" }} onClick={() => switchNetwork()}>
          {env.chainIds[0] === 5 && "Ethereum Goerli Testnet"}
          {env.chainIds[0] === 137 && "Polygon"}
          {env.chainIds[0] === 31337 && "Local"}
        </Button>
      </Content>
    </Modal>
  );
}
