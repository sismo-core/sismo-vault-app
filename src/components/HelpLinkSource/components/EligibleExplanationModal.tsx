import { useEffect, useState } from "react";
import styled from "styled-components";
import Button from "../../Button";
import Modal from "../../Modal";
import { Text } from "../../Text";

const Content = styled.div`
  padding: 40px 30px 30px 30px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-height: calc(100vh - 160px);
  max-width: calc(600px - 60px);
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

const Explanations = styled.div`
  height: 90%;
  overflow-y: auto;

  /* width */
  ::-webkit-scrollbar {
    width: 5px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: #1b2947;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #2a3557;
    border-radius: 20px;
    cursor: pointer;
    width: 5px;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
  }
`;

const Title = styled.div`
  font-size: 20px;
  color: #e9ecff;

  margin-bottom: 5px;
  font-family: ${(props) => props.theme.fonts.semibold};
  display: flex;
`;

const SectionTitle = styled.div`
  font-size: 14px;
  margin-bottom: 10px;
  margin-top: 35px;
  color: #e9ecff;
  font-family: ${(props) => props.theme.fonts.bold};
`;

const Header = styled.div``;

const Bottom = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

type ExplanationModalProps = {
  onClose: () => void;
  isOpen: boolean;
};

export default function EligibleExplanationModal({
  isOpen,
  onClose,
}: ExplanationModalProps): JSX.Element {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAnimated(true);
    }
  }, [isOpen]);

  //https://source-store.sismo.io/data/0x037059f9f574b33ee4e11c8302d9606c33b357c8c7c89bfbec464386d4378d4b.json

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      animated={animated}
      outsideClosable
    >
      <Content>
        <Header>
          <Title>Eligible accounts</Title>
        </Header>
        <Explanations>
          <SectionTitle>What is an Eligible account?</SectionTitle>
          <Text style={{ marginBottom: 5 }}>
            An Eligible account is the source that Badges are derived from. If
            one of your imported accounts meets the requirements for minting a
            Badge, it is considered an Eligible account.
          </Text>

          <SectionTitle>Do my Eligible accounts remain private?</SectionTitle>
          <Text style={{}}>
            When minting ZK Badges, no link between your Eligible and
            Destination accounts is ever created. ZK proofs generated in your
            Sismo Vault prove you own your desired Destination account without
            linking the two.
          </Text>

          <SectionTitle>
            How do I import an Eligible account into my Vault?
          </SectionTitle>
          <Text style={{ marginBottom: 5 }}>
            To import an Eligible account into your Vault, you simply sign the
            two wallet messages necessary to generate ZK proofs and mint ZK
            Badges.
          </Text>
          <Text>
            These cryptographic signatures are stored in your encrypted Vault so
            you don’t have to sign the messages every time you mint a Badge.
          </Text>

          <SectionTitle>Who can access my vault?</SectionTitle>
          <Text>
            Only wallets designated as Vault Owners can access your Vault. The
            Sismo Vault only ever exists in its decrypted state in a user’s
            browser—remaining fully encrypted in the Sismo Vault backend.
            Imported accounts are designated as Vault Owners by default, though
            this can be modified in the app’s settings.
          </Text>
        </Explanations>
        <Bottom style={{ marginTop: 30 }}>
          <Button success style={{ width: 250 }} onClick={() => onClose()}>
            Got it
          </Button>
        </Bottom>
      </Content>
    </Modal>
  );
}
