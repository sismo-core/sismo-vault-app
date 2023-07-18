import { useEffect, useState } from "react";
import styled from "styled-components";
import Button from "../../../../components/Button";
import Modal from "../../../../components/Modal";
import { Text } from "../../../../components/Text";

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

const Highlight = styled.span`
  color: ${(props) => props.theme.colors.success};
`;

type Props = {
  onClose: () => void;
  isOpen: boolean;
};

export default function VaultAccessModal({ isOpen, onClose }: Props): JSX.Element {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAnimated(true);
    }
  }, [isOpen]);

  //https://source-store.sismo.io/data/0x037059f9f574b33ee4e11c8302d9606c33b357c8c7c89bfbec464386d4378d4b.json

  return (
    <Modal isOpen={isOpen} onClose={onClose} animated={animated} outsideClosable>
      <Content>
        <Header>
          <Title>Vault Access</Title>
        </Header>
        <Explanations>
          <SectionTitle>Sismo Vault</SectionTitle>
          <Text style={{ marginBottom: 5 }}>
            The Sismo Vault is an encrypted privacy-preserving UX tool that stores the secrets
            necessary to generate zero-knowledge proofs. Users import accounts into the Vault to
            privately prove facts about their identities. The Sismo Vault only ever exists in its
            decrypted state in a user's browser—remaining fully encrypted in the Sismo Vault
            backend. Read more here
          </Text>

          <SectionTitle>Vault Owners</SectionTitle>
          <Text style={{ marginBottom: 5 }}>
            Only accounts designated as Vault Owners can decrypt the Sismo Vault. Any account
            imported into the Vault is a Vault Owner by default, though this can be modified in the
            app's settings. For now, accounts can only own a single Vault.
          </Text>
          <Text style={{}}>
            We advise you to import a <Highlight>securely backed wallet</Highlight> (cold wallet) to
            your Vault, so you can always access your Vault.
          </Text>

          <SectionTitle>Vault Recovery Keys</SectionTitle>
          <Text style={{ marginBottom: 5 }}>
            Every Vault has Vault Recovery Keys—used to regain access to a Vault if a user loses
            access.
          </Text>
          <Text style={{ marginBottom: 5 }}>
            Anyone can generate Vault Recovery Keys to prevent themselves from losing access to
            their Vault. Store your Vault Recovery Keys in a secure password manager and never share
            it.
          </Text>
          <Text>Make sure you are always on app.sismo.io when using your Vault Recovery Keys.</Text>
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
