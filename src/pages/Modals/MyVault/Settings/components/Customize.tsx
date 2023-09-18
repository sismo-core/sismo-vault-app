import { useState } from "react";
import styled from "styled-components";
import Button from "../../../../../components/Button";
import Icon from "../../../../../components/Icon";
import TextInput from "../../../../../components/TextInput";
import Ziki from "../../../../../components/Ziki";
import colors from "../../../../../theme/colors";
import { useNotifications } from "../../../../../components/Notifications/provider";
import * as Sentry from "@sentry/react";
import { useVault } from "../../../../../hooks/vault";

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

const Inline = styled.div`
  display: flex;
  align-items: center;
  height: 42px;
`;

const Name = styled.div`
  font-size: 16px;
  line-height: 22px;
  display: flex;
  align-items: center;
  text-align: center;
  color: ${colors.blue0};
  cursor: pointer;
`;

export default function Customize() {
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const vault = useVault();
  const [editNameValue, setEditNameValue] = useState(vault.vaultName);
  const { notificationAdded } = useNotifications();

  const saveNewName = async () => {
    setLoading(true);
    try {
      await vault.updateName(editNameValue);
      notificationAdded({
        text: "New name has been encrypted in your Sismo vault.",
        type: "success",
      });
      setEditIsOpen(false);
    } catch (e) {
      console.error("Update name", e);
      const eventId = Sentry.captureException(e, {
        tags: {
          file: "Customization.tsx",
          function: "saveNewName",
        },
      });
      notificationAdded({
        text:
          "An error occurred while saving your vault, please try again." +
          " - Error id: " +
          eventId,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title style={{ marginBottom: 20 }}>Customize</Title>
      <Inline>
        <Ziki name="ziki8" style={{ width: 28, marginRight: 18 }} />
        {editIsOpen ? (
          <>
            <TextInput
              value={editNameValue}
              onChange={(text) => setEditNameValue(text)}
              placeholder={"Your account name"}
              maxLength={20}
            />
            <Button
              onClick={() => saveNewName()}
              style={{ marginLeft: 10, width: 80 }}
              disabled={editNameValue === vault.vaultName}
              primary
              loading={loading}
            >
              {loading ? "" : "Save"}
            </Button>
          </>
        ) : (
          <Name onClick={() => setEditIsOpen(true)}>
            {vault.vaultName}
            <Icon
              name="edit-outline-white"
              style={{ width: 15, height: 15, marginLeft: 5 }}
            />
          </Name>
        )}
      </Inline>
    </Container>
  );
}
