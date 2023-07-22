import { useState } from "react";
import styled from "styled-components";
import colors from "../../../../theme/colors";
import { Owner } from "../../../../services/vault-client";
import { useVault } from "../../../../hooks/vault";
import Button from "../../../../components/Button";
import Icon from "../../../../components/Icon";
import { useNotifications } from "../../../../components/Notifications/provider";
import TextArea from "../../../../components/TextArea";
import { useLogger } from "../../../../hooks/logger";

const Container = styled.div`
  width: 330px;
  padding: 40px 30px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  @media (max-width: 800px) {
    width: 315px;
  }
`;

const Label = styled.div`
  font-size: 14px;
  line-height: 150%;
  color: #e9ecff;
  display: flex;
  align-items: center;
`;

const Error = styled.div`
  color: ${colors.error};
  font-size: 10px;
  line-height: 150%;
  position: absolute;
  bottom: -15px;
`;

const Input = styled.div`
  position: relative;
`;

const Title = styled.div`
  font-size: 20px;
  color: #e9ecff;
  width: 100%;
`;

type Props = {
  onConnected: () => void;
};

export default function AccessRecoveryKey({ onConnected }: Props): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState("");
  const [noVaultFound, setNoVaultFound] = useState(null);
  const vault = useVault();
  const logger = useLogger();
  const { notificationAdded } = useNotifications();

  const connect = async () => {
    setLoading(true);
    const owner: Owner = {
      identifier: null,
      seed: recoveryKey,
      timestamp: Date.now(),
    };
    try {
      const isConnected = await vault.connect(owner);
      if (isConnected) {
        onConnected();
        setNoVaultFound(false);
      } else {
        setNoVaultFound(true);
      }
    } catch (error) {
      const errorId = await logger.error({
        error,
        sourceId: "ConnectVaultModal-AccessRecoveryKey-connect",
        level: "fatal",
      });
      notificationAdded(
        {
          text: "An error occurred while connecting to your Vault. If this persists, please feel free to contact us on Discord with a screenshot of this message.",
          type: "error",
          code: errorId,
        },
        1000000
      );
    }
    setLoading(false);
  };

  return (
    <Container>
      <Title style={{ marginBottom: 20 }}>Access Sismo Vault</Title>
      <Label style={{ marginBottom: 5 }}>
        Enter your Vault Recovery Key
        <Icon name="key-outline-white" style={{ width: 20, marginLeft: 5, marginBottom: -2 }} />
      </Label>
      <Input>
        <TextArea
          value={recoveryKey}
          onChange={(text) => setRecoveryKey(text)}
          placeholder={"e.g: 0xa3e165f15905112ab287ec7464ea8b3acd4d538df69287e7097f9874454c59da"}
          error={noVaultFound}
        />
        {noVaultFound && <Error>No Vault found</Error>}
      </Input>
      <Button
        style={{
          marginTop: 25,
          width: "100%",
        }}
        onClick={() => connect()}
        primary
        loading={loading}
        disabled={!recoveryKey}
      >
        {loading ? "Verifying..." : "Connect"}
      </Button>
    </Container>
  );
}
