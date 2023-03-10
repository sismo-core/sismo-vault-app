import styled from "styled-components";
import ConnectVaultModal from "../Modals/ConnectVaultModal";
import { useState } from "react";
import { useVault } from "../../libs/vault";

const Container = styled.div``;

export default function Home() {
  const [connectIsOpen, setConnectIsOpen] = useState(false);
  const vault = useVault();

  return (
    <>
      <ConnectVaultModal
        isOpen={connectIsOpen}
        onClose={() => setConnectIsOpen(false)}
      />
      <Container>{vault.isConnected && <div></div>}</Container>
    </>
  );
}
