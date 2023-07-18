import { useState } from "react";
import styled from "styled-components";
import { useVault } from "../../hooks/vault";
import ConnectVaultModal from "../../pages/Modals/ConnectVaultModal";
import Button from "../Button";

const Container = styled.div``;

export default function SignInButton(): JSX.Element {
  const [connectIsOpen, setConnectIsOpen] = useState(false);
  const vault = useVault();

  return (
    <Container>
      <ConnectVaultModal isOpen={connectIsOpen} onClose={() => setConnectIsOpen(false)} />
      <Button
        primary
        loading={vault.loadingActiveSession}
        style={{ width: 252 }}
        onClick={() => setConnectIsOpen(true)}
      >
        {vault.loadingActiveSession ? "Sign-in to Sismo..." : "Sign-in to Sismo"}
      </Button>
    </Container>
  );
}
