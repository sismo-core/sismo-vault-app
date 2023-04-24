import styled from "styled-components";
import colors from "../../theme/colors";
import Button from "../Button";
import Modal from "../Modal";

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 30px;
  max-width: 200px;
`;

const Text = styled.div`
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  display: flex;
  align-items: center;
  text-align: center;
  color: ${colors.blue0};
`;

const Inline = styled.div`
  display: flex;
  gap: 20px;
`;

type ConnectVaultModalProps = {
  text: string;
  isOpen: boolean;
  onClose: () => void;
  onYes: () => void;
  onNo: () => void;
};

export default function YesNoModal({
  isOpen,
  onClose,
  onYes,
  onNo,
  text,
}: ConnectVaultModalProps): JSX.Element {
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        animated
        outsideClosable
        zIndex={10000}
      >
        <Content>
          <Text style={{ marginBottom: 20 }}>{text}</Text>
          <Inline>
            <Button style={{ width: "100%" }} onClick={() => onYes()}>
              Yes
            </Button>
            <Button style={{ width: "100%" }} onClick={() => onNo()}>
              No
            </Button>
          </Inline>
        </Content>
      </Modal>
    </>
  );
}
