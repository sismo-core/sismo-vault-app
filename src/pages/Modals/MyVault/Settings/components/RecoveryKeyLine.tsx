import { useState } from "react";
import styled from "styled-components";
import colors from "../../../../../theme/colors";
import YesNoModal from "../../../../../components/YesNoModal";
import Icon from "../../../../../components/Icon";
import { useVault } from "../../../../../libs/vault";
import { RecoveryKey } from "../../../../../libs/vault-client-v2";

const Container = styled.div`
  font-weight: 500;
  font-size: 16px;
  line-height: 150%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${colors.blue0};
  height: 65px;
  min-height: 65px;
  box-sizing: border-box;
  padding: 10px;
  border-radius: 2px;
  width: 100%;
`;

const Name = styled.div`
  display: flex;
  position: relative;
  align-items: center;
`;

const Actions = styled.div`
  display: flex;
`;

const Action = styled.div`
  width: 25px;
  height: 25px;
  border-radius: 5px;
  border: 1px solid transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  :hover {
    border: 1px solid #414a71;
  }
`;

type Props = {
  recoveryKey: RecoveryKey;
};

export default function RecoveryKeyLine({ recoveryKey }: Props) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const vault = useVault();

  const deleteKey = async () => {
    await vault.disableRecoveryKey(recoveryKey.key);
  };

  return (
    <>
      <YesNoModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onYes={() => {
          setConfirmDeleteOpen(false);
          deleteKey();
        }}
        onNo={() => setConfirmDeleteOpen(false)}
        text={`Are you sure you want to delete ${recoveryKey.name}?`}
      />
      <Container>
        <Name>
          <Icon
            name="key-outline-white"
            style={{ width: 26, marginRight: 5, marginBottom: -3 }}
          />
          {recoveryKey.name}
        </Name>
        <Actions>
          {vault.connectedOwner.seed !== recoveryKey.key && (
            <Action
              onClick={(e) => {
                setConfirmDeleteOpen(true);
                e.stopPropagation();
              }}
            >
              <Icon name="delete-outline-white" style={{ width: 16 }} />
            </Action>
          )}
        </Actions>
      </Container>
    </>
  );
}
