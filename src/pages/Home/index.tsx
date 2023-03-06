import styled from "styled-components";
import ConnectVaultModal from "../Modals/ConnectVaultModal";
import { useEffect, useState } from "react";
import { useVault } from "../../libs/vault";

const Container = styled.div``;

export default function Home() {
  const [connectIsOpen, setConnectIsOpen] = useState(false);
  const vault = useVault();

  // useEffect(() => {
  //   if (vault.isConnected) {
  //     setConnectIsOpen(false);
  //   }
  //   if(!vault.isConnected) {
  //     setConnectIsOpen(true);
  //   }
  // }, [vault.isConnected]);

  return (
    <>
      <ConnectVaultModal
        isOpen={connectIsOpen}
        onClose={() => setConnectIsOpen(false)}
      />
      <Container>{vault.isConnected && <div>IS CONNECTED </div>}</Container>
    </>
  );
}
