import styled from "styled-components";
import ConnectVaultModal from "../Modals/ConnectVaultModal";
import { useState } from "react";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  // max-height: calc(100vh - 100px)
`;

const Art = styled.img`
  height: 90vh;
  margin-top: 50px;
  margin-right: 80px;
`;

export default function Home() {
  const [connectIsOpen, setConnectIsOpen] = useState(false);

  return (
    <>
      <ConnectVaultModal
        isOpen={connectIsOpen}
        onClose={() => setConnectIsOpen(false)}
      />
      <Container>
        <Art src="/assets/sismo-landing-art.svg" />
      </Container>
    </>
  );
}
