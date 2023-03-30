import styled from "styled-components";
import { useEffect, useState } from "react";
import Modal from "../../../../../../components/Modal";
import { ZkConnectResponse } from "../../../../localTypes";

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
  padding: 1px 10px 1px 10px;
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

const SelectorWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: -20px;
`;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  response: ZkConnectResponse;
};

export default function ProofModal({
  isOpen,
  onClose,
  response,
}: Props): JSX.Element {
  const [selectedType, setSelectedType] = useState<"bytes" | "typescript">(
    "bytes"
  );

  const typescriptResponse = {
    appId: response?.appId,
    namespace: response?.namespace,
    version: response?.version,
    proofs: response?.proofs,
  };

  const bytesResponse = response?.zkConnectResponseBytes;

  const [readableResponse, setReadableResponse] = useState<string>(
    selectedType === "typescript"
      ? JSON.stringify(typescriptResponse)
      : bytesResponse
  );

  useEffect(() => {
    if (selectedType === "bytes") {
      setReadableResponse(bytesResponse);
    } else {
      setReadableResponse(JSON.stringify(typescriptResponse));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, response]);

  function copyToClipboard() {
    navigator.clipboard.writeText(readableResponse);
  }

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
          <SelectorWrapper>
            <GroupItem
              isSelected={selectedType === "bytes"}
              onClick={() => setSelectedType("bytes")}
            >
              <span>{"Bytes"}</span>
            </GroupItem>
            <GroupItem
              isSelected={selectedType === "typescript"}
              onClick={() => setSelectedType("typescript")}
            >
              <span>{"Typescript"}</span>
            </GroupItem>
          </SelectorWrapper>
          <div style={{ cursor: "pointer" }} onClick={copyToClipboard}>
            {readableResponse}
          </div>
        </Container>
      )}
    </Modal>
  );
}
