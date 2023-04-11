import styled from "styled-components";
import { useEffect, useState } from "react";
import Modal from "../../../../../../components/Modal";
import { getSismoConnectResponseBytes } from "../../../../../../libs/sismo-client/sismo-connect-prover/sismo-connect-v1/utils/getSismoConnectResponseBytes";
import { SismoConnectResponse } from "../../../../../../libs/sismo-client/sismo-connect-prover/sismo-connect-v1";
import colors from "../../../../../../theme/colors";
import fonts from "../../../../../../theme/fonts";
import Button from "../../../../../../components/Button";
import { CheckCircle, Columns, Copy } from "phosphor-react";

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

const Flex = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0px;
  align-items: flex-end;
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
  response: SismoConnectResponse;
  registryTreeRoot: string;
};

export default function ProofModal({
  isOpen,
  onClose,
  response,
  registryTreeRoot,
}: Props): JSX.Element {
  const [selectedType, setSelectedType] = useState<"bytes" | "typescript">(
    "bytes"
  );
  const [isCopied, setIsCopied] = useState(false);

  const typescriptResponse: SismoConnectResponse = {
    appId: response?.appId,
    namespace: response?.namespace,
    version: response?.version,
    signedMessage: response?.signedMessage,
    proofs: response?.proofs,
  };

  const bytesResponse = getSismoConnectResponseBytes(response);

  const [readableResponse, setReadableResponse] = useState<string>(
    selectedType === "typescript"
      ? JSON.stringify(typescriptResponse)
      : bytesResponse
  );

  useEffect(() => {
    if (selectedType === "bytes") {
      setReadableResponse(bytesResponse);
    } else {
      setReadableResponse(JSON.stringify(typescriptResponse, null, 2));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, response]);

  function copyToClipboard() {
    setIsCopied(true);
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
              onClick={() => {
                setIsCopied(false);
                setSelectedType("bytes");
              }}
            >
              <span>{"Bytes"}</span>
            </GroupItem>
            <GroupItem
              isSelected={selectedType === "typescript"}
              onClick={() => {
                setIsCopied(false);
                setSelectedType("typescript");
              }}
            >
              <span>{"Typescript"}</span>
            </GroupItem>
          </SelectorWrapper>
          <div>
            <span>{"Registry Tree Root: "}</span>
            <span>{registryTreeRoot}</span>
          </div>

          <FlexColumn style={{ cursor: "pointer" }}>
            <Button
              onClick={copyToClipboard}
              style={{
                fontSize: 12,
                height: 30,
                padding: "0 15px",
                width: 190,
              }}
            >
              <Flex>
                <div style={{ fontSize: 14 }}>{"Copy to clipboard"}</div>
                {isCopied ? (
                  <CheckCircle size={18} color={colors.green1} />
                ) : (
                  <Copy size={16} />
                )}
              </Flex>
            </Button>
            {readableResponse}
          </FlexColumn>
        </Container>
      )}
    </Modal>
  );
}
