import styled from "styled-components";
import Button from "../../../../../components/Button";
import Loader from "../../../../../components/Loader";
import colors from "../../../../../theme/colors";
import { ImportedAccount } from "../../../../../services/vault-client";
import { useVault } from "../../../../../hooks/vault";
import { useImportAccount } from "../../../ImportAccount/provider";
import AccountLine from "./AccountLine";

const Container = styled.div`
  background-color: ${colors.blue10};
  border-radius: 5px;
  padding: 30px 30px 100px 30px;
  margin-bottom: 20px;
  height: 100%;
  width: 100%;
  min-height: 50vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Importing = styled.div`
  color: ${colors.blue3};
  width: 100%;
  display: flex;
  align-items: center;
  margin-left: 30px;
  height: 65px;
`;

const LoadingText = styled.div`
  color: ${colors.blue3};
`;

const Bottom = styled.div`
  position: absolute;
  bottom: 40px;
`;

const NoImportedSource = styled.div`
  color: ${colors.blue3};
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
`;

const AllAccounts = styled.div<{ selected: boolean }>`
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
  padding: 10px 10px 10px 20px;
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

const AccountsScroll = styled.div`
  overflow-x: auto;
  max-height: 100%;
  width: 100%;
  padding-right: 10px;
  padding-left: 10px;

  /* width */
  ::-webkit-scrollbar {
    width: 5px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: #1b2947;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #2a3557;
    border-radius: 20px;
    cursor: pointer;
    width: 5px;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
  }
`;

type Props = {
  selectedAccount: ImportedAccount;
  onSelectAccount: (account: ImportedAccount) => void;
};

export default function ImportedAccounts({ selectedAccount, onSelectAccount }: Props) {
  const importAccount = useImportAccount();
  const vault = useVault();

  return (
    <Container>
      {vault?.importedAccounts && vault?.importedAccounts?.length > 0 && (
        <AllAccounts selected={selectedAccount === null} onClick={() => onSelectAccount(null)}>
          All
        </AllAccounts>
      )}
      <AccountsScroll>
        {vault?.importedAccounts &&
          vault?.importedAccounts?.length > 0 &&
          vault?.importedAccounts?.map((account) => (
            <AccountLine
              account={account}
              isSelected={selectedAccount && selectedAccount.identifier === account.identifier}
              onSelectAccount={() => onSelectAccount(account)}
              key={"account" + account.identifier}
            />
          ))}
      </AccountsScroll>
      {importAccount?.importing && (
        <Importing>
          <Loader size={15} style={{ marginRight: 15 }} />
          <LoadingText>Importing...</LoadingText>
        </Importing>
      )}
      {!importAccount?.importing &&
        vault?.importedAccounts &&
        vault?.importedAccounts.length === 0 && (
          <NoImportedSource style={{ marginTop: 50, marginBottom: 50 }}>
            No accounts imported in your Sismo vault
          </NoImportedSource>
        )}
      <Bottom>
        <Button
          style={{ width: 230, marginTop: 10 }}
          onClick={() =>
            importAccount.open({
              importType: "account",
            })
          }
        >
          + Import account
        </Button>
      </Bottom>
    </Container>
  );
}
