import { useEffect, useState } from "react";
import styled from "styled-components";
import Button from "../Button";
import Icon from "../Icon";
import Modal from "../Modal";
import { Text } from "../Text";

const Content = styled.div`
  padding: 40px 30px 30px 30px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-height: calc(100vh - 160px);

  max-width: calc(400px - 60px);
  @media (max-width: 800px) {
    max-width: calc(600px - 60px);
    padding: 30px 20px;
  }
  @media (max-width: 700px) {
    max-width: calc(550px - 60px);
    padding: 20px 20px;
  }
  @media (max-width: 600px) {
    max-width: calc(450px - 60px);
  }
`;

const Title = styled.div`
  font-size: 20px;
  color: #e9ecff;
  font-family: ${(props) => props.theme.fonts.semibold};
  display: flex;
`;

const Header = styled.div`
  margin-bottom: 25px;
`;

const Bottom = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FAQLink = styled.a`
  font-size: 14px;
  color: #e9ecff;
  line-height: 150%;
  text-decoration: none;
`;

type ExplanationModalProps = {
  onClose: () => void;
  onContinue: () => void;
  isOpen: boolean;
};

export default function DestinationSameThanSourceModal({
  isOpen,
  onContinue,
  onClose,
}: ExplanationModalProps): JSX.Element {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAnimated(true);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      animated={animated}
      outsideClosable
    >
      <Content>
        <Header>
          <Title>Caution!</Title>
        </Header>
        <Text style={{ marginBottom: 15 }}>
          The Destination account you selected is also the Badge’s Eligible
          account.
        </Text>
        <Text style={{ marginBottom: 15 }}>
          If you want to use your Badge in a privacy-preserving manner, you
          should select another Destination account.
        </Text>
        <FAQLink
          href="https://docs.sismo.io/sismo-docs/user-faq#what-are-zk-badges-and-why-are-they-interesting"
          target="_blank"
        >
          ZK Badges FAQ
          <Icon
            name="externalLink-outline-white"
            style={{ width: 12, marginLeft: 5, marginBottom: 7 }}
          />
        </FAQLink>

        <Bottom style={{ marginTop: 30 }}>
          <Button
            success
            style={{ width: 270, marginBottom: 10 }}
            onClick={() => onClose()}
          >
            Change destination address
          </Button>
          <Button
            transparent
            style={{ width: 270 }}
            onClick={() => onContinue()}
          >
            I am aware, continue
          </Button>
        </Bottom>
      </Content>
    </Modal>
  );
}
