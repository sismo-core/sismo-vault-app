import Button from "../../../../../components/Button";
import { Text } from "../../../../../components/Text";
import Account from "../../../../../components/Account";
import { useWallet } from "../../../../../hooks/wallet";
import { getMinimalIdentifier } from "../../../../../utils/getMinimalIdentifier";

type Props = {
  onNext: () => void;
  importTarget: string;
};

export default function WrongImported({ onNext, importTarget }: Props): JSX.Element {
  const wallet = useWallet();

  return (
    <>
      <Account
        address={wallet.activeAddress}
        main={wallet.activeMainMinified}
        subtitle={"Wrong account"}
        state={"error"}
        style={{}}
      />
      <Text style={{ marginBottom: 15, marginTop: 15 }}>
        You select the wrong account. <br />
        Please import <b>{getMinimalIdentifier(importTarget)}</b>
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
