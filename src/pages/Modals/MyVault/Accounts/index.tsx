import { useState } from "react";
import MyVaultContainer from "../components/MyVaultContainer";
import { ImportedAccount } from "../../../../services/vault-client";
import ImportedAccounts from "./components/ImportedAccounts";

export default function Accounts() {
  const [selectedAccount, setSelectedAccount] = useState<ImportedAccount>(null);

  return (
    <MyVaultContainer
      left={
        <ImportedAccounts
          selectedAccount={selectedAccount}
          onSelectAccount={(account) => setSelectedAccount(account)}
        />
      }
    />
  );
}
