import { useEffect, useState } from "react";
import styled from "styled-components";
import colors from "../../theme/colors";
import Button from "../Button";
import Modal from "../Modal";
import { Text } from "../Text";

const Content = styled.div`
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-height: calc(100vh - 160px);

  max-width: calc(460px - 60px);
`;

const Title = styled.div`
  font-size: 20px;
  color: #e9ecff;
  font-family: ${(props) => props.theme.fonts.semibold};
  display: flex;
`;

const Bottom = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Highlight = styled.span`
  color: ${colors.orange2};
`;

type Props = {
  onClose: () => void;
  onContinue: () => void;
  isOpen: boolean;
};

export default function Web2PrivacyModal({ isOpen, onContinue, onClose }: Props): JSX.Element {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAnimated(true);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} animated={animated} outsideClosable>
      <Content>
        <Title style={{ marginBottom: 15 }}>Caution</Title>
        <Text style={{ marginBottom: 10 }}>
          When you imported your Web2 account to your vault, you created connection logs.
        </Text>
        <Text style={{ marginBottom: 10 }}>
          No one can learn more from the logs than you are a Sismo User unless they correlate your
          log timestamp to on-chain activity.
        </Text>
        <Text>
          <Highlight>To preserve your privacy at its fullest</Highlight>, we advise you to{" "}
          <Highlight>wait a moment</Highlight> before minting a ZK Badge so no one can correlate
          your Web2 account with your ZK Badge destination.
        </Text>
        <Bottom style={{ marginTop: 30 }}>
          <Button gold style={{ width: 250, marginBottom: 10 }} onClick={() => onContinue()}>
            I'm aware, continue
          </Button>
          <Button style={{ width: 250 }} onClick={() => onClose()}>
            I will come back later
          </Button>
        </Bottom>
      </Content>
    </Modal>
  );
}
