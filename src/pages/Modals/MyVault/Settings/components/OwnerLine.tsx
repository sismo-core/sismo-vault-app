import { useState } from "react";
import styled from "styled-components";
import colors from "../../../../../theme/colors";
import YesNoModal from "../../../../../components/YesNoModal";
import { getMainMinified } from "../../../../../utils/getMain";
import Icon from "../../../../../components/Icon";
import { useVault } from "../../../../../libs/vault";
import { Owner } from "../../../../../libs/vault-client";
import Avatar from "../../../../../components/Avatar";

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

const Infos = styled.div`
  display: flex;
  position: relative;
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

const OwnerKeyContainer = styled.div`
  position: absolute;
`;

const OwnerKey = styled.div`
  position: absolute;
  bottom: -43px;
  left: -13px;
`;

const ConnectedOwner = styled.div`
  color: ${colors.blue3};
  font-size: 12px;
`;

type Props = {
  owner: Owner;
};

export default function OwnerLine({ owner }: Props) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const vault = useVault();

  const deleteAccount = async () => {
    await vault.deleteOwners([owner]);
  };

  return (
    <>
      <YesNoModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onYes={() => {
          setConfirmDeleteOpen(false);
          deleteAccount();
        }}
        onNo={() => setConfirmDeleteOpen(false)}
        text={`Are you sure you want to delete ${getMainMinified(owner)}?`}
      />
      <Container>
        <Infos>
          <Avatar account={owner} style={{ marginRight: 15 }} />
          <OwnerKeyContainer>
            <OwnerKey>
              <Icon name="key-fill-blue" />
            </OwnerKey>
          </OwnerKeyContainer>
          {getMainMinified(owner)}
        </Infos>
        <Actions>
          {vault.connectedOwner &&
            vault.connectedOwner.identifier === owner.identifier && (
              <ConnectedOwner>Connected owner</ConnectedOwner>
            )}
          {vault.connectedOwner &&
            vault.connectedOwner.identifier !== owner.identifier &&
            vault.owners.length > 1 && (
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
