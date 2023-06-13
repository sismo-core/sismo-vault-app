import styled from "styled-components";
import { useWallet } from "../../../../../hooks/wallet";
import Button from "../../../../../components/Button";
import { getMinimalIdentifier } from "../../../../../utils/getMinimalIdentifier";

const Title = styled.div`
  width: 100%;
  font-family: ${(props) => props.theme.fonts.medium};
  font-size: 20px;
  text-align: left;
  color: white;
`;

const ExtensionArrow = styled.img`
  position: fixed;
  top: 100px;
  right: 230px;
  z-index: 20;

  @media (max-width: 1100px) {
    top: 20px;
  }
  @media (max-width: 600px) {
    display: none;
  }
`;

const Bottom = styled.div``;

type SwitchActiveTutoProps = {
  onCancel: () => void;
  importTarget: string;
};

export default function SwitchActiveTutoStep({
  importTarget,
  onCancel,
}: SwitchActiveTutoProps): JSX.Element {
  const wallet = useWallet();

  return (
    <>
      {wallet.isInjectedWallet && <ExtensionArrow src="/assets/arrow.svg" />}
      <Title style={{ marginBottom: 18 }}>
        Select{" "}
        {importTarget ? getMinimalIdentifier(importTarget) : "another account"}{" "}
        in your wallet {wallet.isInjectedWallet && "extension"}
      </Title>
      <Bottom>
        <Button
          style={{
            marginBottom: 12,
            width: "100%",
          }}
          loading={true}
          primary
        >
          Change active address
        </Button>
        <Button
          style={{
            width: "100%",
          }}
          onClick={() => onCancel()}
        >
          Cancel
        </Button>
      </Bottom>
    </>
  );
}
