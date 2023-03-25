import styled from "styled-components";
import { useEffect, useState } from "react";
import Modal from "../../../../../../components/Modal";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  max-width: 800px;
  min-width: 795px;
  padding: 60px;
  color: ${(props) => props.theme.colors.blue0};
  background-color: ${(props) => props.theme.colors.blue11};
  border-radius: 10px;

  @media (max-width: 900px) {
    height: auto;
    top: default;
    max-width: calc(100vw - 80px);
    min-width: calc(100vw - 80px);
    padding: 25px;
    width: calc(100vw - 80px);
    gap: 15px;
  }
`;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  response: any;
};

export default function ProofModal({
  isOpen,
  onClose,
  response,
}: Props): JSX.Element {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      animated
      outsideClosable
      zIndex={2008}
    >
      <Container>{JSON.stringify(response)}</Container>
    </Modal>
  );
}
