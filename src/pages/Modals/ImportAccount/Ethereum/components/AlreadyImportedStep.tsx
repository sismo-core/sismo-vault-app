import Button from "../../../../../components/Button";
import { Text } from "../../../../../components/Text";
import Account from "../../../../../components/Account";
import { useWallet } from "../../../../../libs/wallet";

type AlreadyImportedProps = {
  onNext: () => void;
};

export default function AlreadyImported({
  onNext,
}: AlreadyImportedProps): JSX.Element {
  const wallet = useWallet();

  return (
    <>
      <Account
        address={wallet.activeAddress}
        main={wallet.activeMainMinified}
        subtitle={"Already imported"}
        state={"error"}
        style={{}}
      />
      <Text style={{ marginBottom: 15, marginTop: 15 }}>
        You have already imported this account into your Sismo Vault.
      </Text>
      <Button
        style={{
          width: "100%",
        }}
        onClick={() => onNext()}
        primary
      >
        Got it
      </Button>
    </>
  );
}
