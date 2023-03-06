import styled from "styled-components";
import colors from "../../../../../theme/colors";
import { useNotifications } from "../../../../../components/Notifications/provider";
import * as Sentry from "@sentry/react";
import { useVault } from "../../../../../libs/vault";
import CheckBox from "../../../../../components/CheckBox";

const Container = styled.div`
  background-color: ${colors.blue10};
  width: 100%;
  box-sizing: border-box;
  padding: 20px 30px 30px 30px;
  position: relative;
  height: 140px;
  margin-bottom: 20px;
`;

const Title = styled.div`
  font-size: 24px;
  line-height: 150%;
  color: #e9ecff;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
`;

const AutoImport = styled.div`
  color: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
`;

export default function Security() {
  const vault = useVault();
  const { notificationAdded } = useNotifications();

  const keepConnected = async () => {
    try {
      await vault.updateKeepConnected(
        vault.connectedOwner,
        !vault.keepConnected
      );
    } catch (e) {
      Sentry.captureException(e);
      notificationAdded({
        text: "An error occurred while saving your vault, please try again.",
        type: "error",
      });
    } finally {
    }
  };

  return (
    <Container>
      <Title style={{ marginBottom: 20 }}>Security</Title>
      <AutoImport
        onClick={() => keepConnected()}
        style={{ marginTop: 30, marginBottom: 15 }}
      >
        <CheckBox isChecked={vault.keepConnected} style={{ marginRight: 8 }} />
        Keep me connected
      </AutoImport>
    </Container>
  );
}
