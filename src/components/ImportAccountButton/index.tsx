import styled from "styled-components";
import Icon from "../Icon";
import HorizontalAvatars from "../HorizontalAvatars";
import Loader from "../Loader";
import colors from "../../theme/colors";
import { AccountType } from "../../libs/vault-client";
import { useImportAccount } from "../../pages/Modals/ImportAccount/provider";
import { useVault } from "../../hooks/vault";

const Container = styled.div`
  display: flex;
  align-items: center;
  color: white;
`;

const Button = styled.div<{
  disabled: boolean;
  minButton: boolean;
}>`
  height: 32px;
  background-color: #2a3557;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px 14px 0px 12px;
  border-radius: 30px;
  ${(props) =>
    !props.disabled &&
    `
    cursor: pointer;
  `}
  ${(props) =>
    props.minButton
      ? `
    width: 32px;
    padding: 0px;
  `
      : `
    width: 140px;
  `}
`;

const CircleButton = styled.div`
  background-color: #2a3557;
  height: 35px;
  width: 35px;
  border-radius: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const Sources = styled.div`
  cursor: pointer;
`;

type Props = {
  onClickOnAccount?: () => void;
  loading?: boolean;
  accountTypes: AccountType[];
};

export default function ImportAccountButton({
  onClickOnAccount,
  accountTypes,
  loading,
}: Props): JSX.Element {
  const importAccount = useImportAccount();
  const vault = useVault();

  return (
    <Container>
      {vault.importedAccounts && vault.importedAccounts.length > 0 && (
        <Sources onClick={() => onClickOnAccount()} style={{ marginRight: 5 }}>
          <HorizontalAvatars accounts={vault.importedAccounts} />
        </Sources>
      )}
      {vault.importedAccounts && vault.importedAccounts.length <= 10 && (
        <Button
          onClick={() =>
            !loading &&
            importAccount.open({
              importType: "account",
              accountTypes: accountTypes,
            })
          }
          minButton={
            vault.importedAccounts && vault.importedAccounts.length >= 10
          }
          disabled={loading}
        >
          {loading ? (
            <Loader
              color={colors.blue0}
              size={12}
              style={
                vault.importedAccounts && vault.importedAccounts.length < 10
                  ? { marginRight: 15, marginLeft: -10 }
                  : null
              }
            />
          ) : (
            <Icon
              name={
                vault.importedAccounts && vault.importedAccounts.length > 0
                  ? "plus-outline-white"
                  : "plus-outline-blue"
              }
              style={{
                width: 12,
                marginRight:
                  vault.importedAccounts && vault.importedAccounts.length < 10
                    ? 7
                    : 0,
                marginTop: 1,
              }}
            />
          )}
          {vault.importedAccounts &&
          vault.importedAccounts.length <= 10 &&
          loading
            ? "Importing..."
            : "Import account"}
        </Button>
      )}
      {vault.importedAccounts && vault.importedAccounts.length > 10 && (
        <CircleButton
          onClick={() =>
            importAccount.open({
              importType: "account",
              accountTypes: accountTypes,
            })
          }
          style={{ marginLeft: 5 }}
        >
          <Icon
            name={
              vault.importedAccounts && vault.importedAccounts.length > 0
                ? "plus-outline-white"
                : "plus-outline-blue"
            }
            style={{ width: 12 }}
          />
        </CircleButton>
      )}
    </Container>
  );
}
