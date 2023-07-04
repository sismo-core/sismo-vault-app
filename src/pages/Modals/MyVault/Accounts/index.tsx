import MyVaultContainer from "../components/MyVaultContainer";
import ImportedAccounts from "./components/ImportedAccounts";

export default function Accounts() {
  return <MyVaultContainer left={<ImportedAccounts />} />;
}
