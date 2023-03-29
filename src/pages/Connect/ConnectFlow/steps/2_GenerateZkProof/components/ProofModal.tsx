import styled from "styled-components";
import { useEffect, useState } from "react";
import Modal from "../../../../../../components/Modal";
import getZkConnectResponseABIEncode from "../../../../utils/getZkConnectResponseABIEncode";

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
  word-break: break-all;

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

const GroupItem = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: 1px 10px 1px 6px;
  gap: 6px;
  font-size: 16px;
  line-height: 24px;
  font-family: ${(props) => props.theme.fonts.medium};
  cursor: pointer;
  border-radius: 10px;
  box-sizing: border-box;

  ${(props) =>
    !props.isSelected
      ? `
    background-color: ${props.theme.colors.blue10};
    color: ${props.theme.colors.blue1};
    border: 1px solid ${props.theme.colors.blue10};
  `
      : `
    background-color: ${props.theme.colors.blue9};
    color: ${props.theme.colors.green1};
    border: 1px solid ${props.theme.colors.green1};
  `}
`;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  response: any;
  type: "bytes" | "typescript";
};

export default function ProofModal({
  isOpen,
  onClose,
  response,
  type,
}: Props): JSX.Element {
  const [selectedType, setSelectedType] = useState<"bytes" | "typescript">(
    type
  );

  const readableResponse =
    type === "bytes"
      ? getZkConnectResponseABIEncode(response)
      : JSON.stringify(response);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      animated
      outsideClosable
      zIndex={2010}
    >
      {response && (
        <Container>
          <GroupItem
            isSelected={selectedType === "bytes"}
            onClick={() => setSelectedType("bytes")}
          >
            <span>{type}</span>
          </GroupItem>
          <GroupItem
            isSelected={selectedType === "typescript"}
            onClick={() => setSelectedType("typescript")}
          >
            <span>{type}</span>
          </GroupItem>
          {readableResponse}
        </Container>
      )}
    </Modal>
  );
}
