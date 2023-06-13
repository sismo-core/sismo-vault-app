import { useState } from "react";
import styled from "styled-components";
import Button from "../../../../components/Button";
import { useNotifications } from "../../../../components/Notifications/provider";
import YesNoModal from "../../../../components/YesNoModal";
import colors from "../../../../theme/colors";
import { useVault } from "../../../../hooks/vault";
import { useMyVault } from "../Provider";
import * as Sentry from "@sentry/react";
//import env from "../../../../environment";

const Container = styled.div`
  background-color: ${colors.blue11};
  border-radius: 5px;
  max-width: 50%;
  @media (max-width: 1200px) {
    max-width: 100%;
  }
`;

const Content = styled.div`
  padding: 30px 30px 100px 30px;
  font-size: 14px;
  line-height: 150%;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${colors.blue0};
  position: relative;
  min-height: calc(100vh - 330px);
`;

const Title = styled.div`
  font-size: 24px;
  width: 100%;
  line-height: 150%;
  display: flex;
  align-items: center;
  color: ${colors.blue0};
`;

const Bottom = styled.div`
  position: absolute;
  bottom: 30px;
`;

export default function More() {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const vault = useVault();
  const myVault = useMyVault();
  const notifications = useNotifications();

  const deleteMyVault = async () => {
    setLoading(true);
    try {
      await vault.deleteVault();
      vault.disconnect();
      myVault.close();
    } catch (e) {
      Sentry.captureException(e);
      notifications.notificationAdded({
        type: "error",
        text: "Can't delete a vault with web2 account imported",
      });
    }
    setLoading(false);
  };

  return (
    <>
      <YesNoModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onYes={() => {
          setConfirmDeleteOpen(false);
          deleteMyVault();
        }}
        onNo={() => setConfirmDeleteOpen(false)}
        text={`Are you sure you want to delete your vault?`}
      />
      <Container>
        <Content>
          <Title style={{ marginBottom: 30 }}>Sismo Vault</Title>
          The vault is a secure and encrypted UX tool that stores the
          cryptographic secrets of your imported accounts so you don't have to
          generate them each time you use Sismo. Vaults are store on a server.
          Since the vault is encrypted, the server is just acting as tool so you
          can retrieve your vault from multiple browsers/devices.
          <br />
          <br />
          The vault can be access by its owners, which are the only addresses
          that can decrypt your vault. By default all imported accounts (as
          sources or destinations) are owners of the vault. It can be modified
          in settings's owners tabs.
          <br />
          <br />
          By signing-in to Sismo with any owner of the vault, you retrieve and
          decrypt the entire vault with all its imported accounts.
          <br />
          <br />
          Each imported account has currently two stored entries in the vault:
          <br />
          <br />
          - The Sismo seed, generated deterministically from a signature. It is
          used as entropy to generate secrets such as a key used to encrypt the
          vault or the secret used to make a the Hydra-S1 ZK commitment.
          <br />- The Hydra-S1 Commitment Receipt. It is generated when
          importing an account as a source or destination and enables you to
          generate ZK Proofs.
          <Bottom>
            {vault.deletable && (
              <Button
                style={{ width: 230, marginTop: 10 }}
                onClick={() => setConfirmDeleteOpen(true)}
                loading={loading}
              >
                {loading ? "Deleting" : "Delete my vault"}
              </Button>
            )}
            {/* {env.name !== "PROD_BETA" && env.name !== "STAGING_BETA" && (
              <Button
                style={{ width: 230, marginTop: 10 }}
                onClick={() => {
                  const error = new Error("This is a warning test");
                  Sentry.withScope(function (scope) {
                    scope.setLevel("warning");
                    Sentry.captureException(error);
                  });
                  throw error;
                }}
                loading={loading}
              >
                Try error
              </Button>
            )} */}
          </Bottom>
        </Content>
      </Container>
    </>
  );
}
