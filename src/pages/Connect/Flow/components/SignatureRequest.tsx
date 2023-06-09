import styled from "styled-components";
import { SelectedSismoConnectRequest } from "../../../../libs/sismo-connect-provers/sismo-connect-prover-v1";
import { PencilSimple } from "phosphor-react";
import colors from "../../../../theme/colors";
import { useEffect, useState } from "react";
import Button from "./ImportButton";
import { useVault } from "../../../../hooks/vault";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  font-size: 14px;
  line-height: 20px;
  color: ${(props) => props.theme.colors.blue0};
  font-family: ${(props) => props.theme.fonts.bold};
`;

const PencilWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
`;

const TextArea = styled.textarea`
  background: ${(props) => props.theme.colors.blue11};
  border-radius: 5px;
  padding: 8px;
  font-size: 14px;
  line-height: 20px;

  outline: none;
  break-word: all;
  color: ${(props) => props.theme.colors.blue0};
  border: 1px solid ${(props) => props.theme.colors.blue0};
  font-family: ${(props) => props.theme.fonts.medium};
  resize: none;
  // min-height: 36px;
  //height: 140px;

  &:disabled {
    background: ${(props) => props.theme.colors.blue9};
    border: 1px solid ${(props) => props.theme.colors.blue9};
  }
`;

const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

type Props = {
  selectedSismoConnectRequest: SelectedSismoConnectRequest;
  proofLoading: boolean;
  onSelectedSismoRequest: (
    selectedSismoConnectRequest: SelectedSismoConnectRequest
  ) => void;
};

export function SignatureRequest({
  selectedSismoConnectRequest,
  proofLoading,
  onSelectedSismoRequest,
}: Props): JSX.Element {
  const vault = useVault();

  const [rows] = useState(3);

  const [isEditing, setIsEditing] = useState(false);
  const [liveValue, setLiveValue] = useState(
    selectedSismoConnectRequest?.selectedSignature?.selectedMessage
  );
  const [savedValue, setSavedValue] = useState(
    selectedSismoConnectRequest?.selectedSignature?.selectedMessage
  );

  const isEditable =
    selectedSismoConnectRequest?.selectedSignature?.isSelectableByUser &&
    vault?.isConnected &&
    !proofLoading;

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLiveValue(e.target.value);
  };

  const onSave = () => {
    setIsEditing(false);
    setSavedValue(liveValue);
    onSelectedSismoRequest({
      ...selectedSismoConnectRequest,
      selectedSignature: {
        ...selectedSismoConnectRequest.selectedSignature,
        selectedMessage: liveValue,
      },
    });
  };

  const onCancel = () => {
    setIsEditing(false);
    setLiveValue(savedValue);
  };

  useEffect(() => {
    if (proofLoading) {
      setIsEditing(false);
      setLiveValue(savedValue);
    }
  }, [proofLoading, savedValue]);

  return (
    <Container>
      <TitleWrapper>
        <span>Signature Request:</span>
        {!isEditing && isEditable && (
          <PencilWrapper onClick={() => isEditable && setIsEditing(!isEditing)}>
            <PencilSimple size={20} color={colors.blue0} />
          </PencilWrapper>
        )}
      </TitleWrapper>
      <TextArea
        disabled={!isEditing}
        value={isEditing ? liveValue : savedValue}
        rows={rows}
        onChange={onChange}
      />
      {isEditing && (
        <ButtonsWrapper>
          <Button verySmall isMedium onClick={onCancel} disabled={proofLoading}>
            Cancel
          </Button>
          <Button
            verySmall
            isMedium
            primary
            onClick={onSave}
            disabled={proofLoading}
          >
            Save
          </Button>
        </ButtonsWrapper>
      )}
    </Container>
  );
}
