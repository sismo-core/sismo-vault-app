import styled from "styled-components";
import { useWallet } from "../../../../../libs/wallet";
import Button from "../../../../../components/Button";
import { getMinimalIdentifier } from "../../../../../utils/getMinimalIdentifier";

const Title = styled.div`
  width: 100%;
  font-family: ${(props) => props.theme.fonts.medium};
  font-size: 20px;
  text-align: left;
  color: white;
`;

const Bottom = styled.div``;

type WhereIsAddressStepProps = {
  onCurrentWallet: () => void;
  onOtherWallet: () => void;
  importTarget: string;
};

export default function WhereIsAddressStep({
  onCurrentWallet,
  onOtherWallet,
  importTarget,
}: WhereIsAddressStepProps): JSX.Element {
  const wallet = useWallet();

  if (!wallet.connected) return <></>;

  return (
    <>
      <Title style={{ marginBottom: 18 }}>
        Where is{" "}
        {importTarget ? (
          getMinimalIdentifier(importTarget)
        ) : (
          <>
            the account you <br />
            want to import
          </>
        )}{" "}
        ?
      </Title>
      <Bottom>
        <Button
          style={{
            marginBottom: 12,
            width: "100%",
          }}
          onClick={() => onCurrentWallet()}
        >
          In{" "}
          {wallet.connected.label === "WalletConnect"
            ? wallet.getWalletConnectName() + " (WC)"
            : wallet.connected.label}
        </Button>
        <Button
          style={{
            width: "100%",
          }}
          onClick={() => onOtherWallet()}
        >
          In another wallet
        </Button>
      </Bottom>
    </>
  );
}
