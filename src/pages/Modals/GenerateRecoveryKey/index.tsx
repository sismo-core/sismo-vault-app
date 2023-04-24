import styled from "styled-components";
import colors from "../../../theme/colors";
import Modal from "../../../components/Modal";
import { zIndex } from "../../../theme/z-index";
import { useGenerateRecoveryKey } from "./provider";
import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import { useVault } from "../../../libs/vault";
import { useNotifications } from "../../../components/Notifications/provider";
import Icon from "../../../components/Icon";
import Loader from "../../../components/Loader";
import * as Sentry from "@sentry/react";

const Content = styled.div`
  display: flex;
  flex-direction: column;
  padding: 30px;
  max-width: calc(550px - 60px);

  color: ${colors.blue0};
  font-size: 14px;
  line-height: 20px;
`;

const Title = styled.div`
  color: ${colors.blue0};
  font-size: 20px;
  line-height: 20px;
`;

const Tips = styled.ul`
  padding: 0px 0px 0px 20px;
  margin: 0px;
`;

const Tip = styled.li`
  list-style-position: outside;
`;

const Bottom = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const GenerateKey = styled.div`
  background: #1c2847;
  border-radius: 5px;
  height: 110px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  cursor: pointer;
`;

const RecoveryKeyString = styled.div`
  background: #343d65;
  border-radius: 5px;
  height: 110px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 30px;
  box-sizing: border-box;
  line-break: anywhere;
`;

const GenerateText = styled.div`
  display: flex;
  align-items: center;
`;

export default function GenerateRecoveryKeyModal(): JSX.Element {
  const generateRecoveryKey = useGenerateRecoveryKey();
  const [key, setKey] = useState(null);
  const [name, setName] = useState(null);
  const [loading, setLoading] = useState(null);
  const vault = useVault();
  const { notificationAdded } = useNotifications();

  useEffect(() => {
    if (!generateRecoveryKey.isOpen) {
      setTimeout(() => {
        setKey(null);
        setName(null);
      }, 300);
    }
  }, [generateRecoveryKey.isOpen]);

  const generate = async () => {
    setLoading(true);
    try {
      let _name = null;
      let _key = null;
      if (!vault.isConnected) await vault.create();
      _key = await vault.generateRecoveryKey();
      setKey(_key);
      setName(_name);
    } catch (e) {
      Sentry.withScope(function (scope) {
        scope.setLevel("fatal");
        Sentry.captureException(e);
      });
      console.log("e", e);
      notificationAdded({
        text: "An error occurred while saving your vault, please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    if (!vault.isConnected && key) {
      vault.connect({
        identifier: null,
        seed: key,
        timestamp: null,
      });
    }
    generateRecoveryKey.close();
  };

  return (
    <Modal
      isOpen={generateRecoveryKey.isOpen}
      onClose={() => close()}
      animated
      outsideClosable
      zIndex={zIndex.generateRecoveryKey}
    >
      <Content>
        <Title style={{ marginBottom: 25 }}>
          Generate a Vault Recovery Key
        </Title>
        <div style={{ marginBottom: 15 }}>
          Your Recovery Key enables you to regain access to your Vault{" "}
        </div>
        {key ? (
          <RecoveryKeyString>
            <div style={{ width: "100%", marginBottom: 10 }}>{name}</div>
            <div>{key}</div>
          </RecoveryKeyString>
        ) : (
          <GenerateKey onClick={() => generate()}>
            <Icon name="lock-outline-white" style={{ marginBottom: 5 }} />
            <GenerateText>
              {loading && <Loader size={10} style={{ marginRight: 10 }} />}
              {loading
                ? "Generating your Recovery Key..."
                : "Click here to generate your Recovery Key"}
            </GenerateText>
          </GenerateKey>
        )}
        <div style={{ marginBottom: 10, marginTop: 15 }}>Tips:</div>
        <Tips style={{ marginBottom: 25 }}>
          <Tip>
            Store your Recovery Key in a password manager like 1Password.
          </Tip>
          <Tip>
            Never share your Recovery Key. Anyone with this key can decrypt your
            Vault.
          </Tip>
          <Tip>Be aware of phishing risks.</Tip>
        </Tips>
        <Bottom>
          <Button style={{ width: 250 }} onClick={() => close()}>
            Close
          </Button>
        </Bottom>
      </Content>
    </Modal>
  );
}
