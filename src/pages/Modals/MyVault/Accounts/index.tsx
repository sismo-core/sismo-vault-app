import { useState } from "react";
import { Badge, MintedBadge } from "../../../../libs/sismo-client";
import MyVaultContainer from "../components/MyVaultContainer";
import { ImportedAccount } from "../../../../libs/vault-client";
import ImportedAccounts from "./components/ImportedAccounts";

export type UserBadge = {};

export type MintedBadges = {
  accounts: ImportedAccount[];
} & Badge;

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
