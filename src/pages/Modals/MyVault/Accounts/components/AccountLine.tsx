import { useState } from "react";
import styled from "styled-components";
import YesNoModal from "../../../../../components/YesNoModal";
import colors from "../../../../../theme/colors";
import { getMainMinified } from "../../../../../utils/getMain";
import Icon from "../../../../../components/Icon";
import { useNotifications } from "../../../../../components/Notifications/provider";
import { getMinimalIdentifier } from "../../../../../utils/getMinimalIdentifier";
import { useVault } from "../../../../../hooks/vault";
import Avatar from "../../../../../components/Avatar";
import { ImportedAccount } from "../../../../../libs/vault-client";
import * as Sentry from "@sentry/react";

const Container = styled.div<{ selected: boolean }>`
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
  cursor: pointer;
  width: 100%;
  ${(props) =>
    props.selected &&
    `
    background-color: ${colors.blue9}; 
    cursor: default;
  `}
`;

const Infos = styled.div`
  display: flex;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
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
  account: ImportedAccount;
  isSelected: boolean;
  onSelectAccount: () => void;
};

export default function AccountLine({ account, isSelected, onSelectAccount }: Props) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const { notificationAdded } = useNotifications();
  const vault = useVault();

  const deleteAccount = async () => {
    try {
      await vault.deleteImportedAccount(account);
    } catch (e) {
      Sentry.captureException(e);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(account.identifier);
    notificationAdded({
      text: `${getMinimalIdentifier(account.identifier)} copied in your clipboard!`,
      type: "success",
    });
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
        text={`Are you sure you want to delete ${getMainMinified(account)}?`}
      />
      <Container
        selected={isSelected}
        onClick={() => onSelectAccount()}
        key={"sources_" + account.identifier}
      >
        <Infos>
          <Avatar account={account} style={{ marginRight: 15 }} />
          {getMainMinified(account)}
        </Infos>
        <Actions>
          <Action
            style={{ marginLeft: 30 }}
            onClick={(e) => {
              copy();
              e.stopPropagation();
            }}
          >
            <Icon name="copy-outline-white" style={{ width: 16 }} />
          </Action>
        </Actions>
      </Container>
    </>
  );
}
