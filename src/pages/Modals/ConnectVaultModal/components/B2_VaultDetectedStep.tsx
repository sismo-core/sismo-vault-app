import styled from "styled-components";
import Button from "../../../../components/Button";
import { Question } from "phosphor-react";
import { useWallet } from "../../../../hooks/wallet";
import { getMinimalIdentifier } from "../../../../utils/getMinimalIdentifier";
import { Owner } from "../../../../libs/vault-client";
import { useVault } from "../../../../hooks/vault";
import { useNotifications } from "../../../../components/Notifications/provider";
import { useEffect, useState } from "react";
import VaultAccessModal from "./VaultAccessModal";
import * as Sentry from "@sentry/react";

const Container = styled.div`
  width: 320px;
  height: 316px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 30px;
  box-sizing: border-box;

  color: ${(props) => props.theme.colors.blue0};

  @media (max-width: 800px) {
    width: 315px;
  }
`;

const Top = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.div`
  align-self: flex-start;
  font-size: 20px;
  line-height: 30px;

  margin-bottom: 3px;
  font-family: ${(props) => props.theme.fonts.medium};
`;

const Text = styled.div`
  font-size: 14px;
  line-height: 20px;
  font-family: ${(props) => props.theme.fonts.regular};

  margin-bottom: 30px;
`;

const Bottom = styled.div`
  width: 252px;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: center;
`;

const VaultAccess = styled.a`
  align-self: flex-end;
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  line-height: 18px;
  cursor: pointer;

  color: inherit;
  text-decoration: none;
`;

type Props = {
  seed: string;
  ownerAddress: string;
  onUseAnotherOwner: () => void;
  onVaultConnected: () => void;
};

export default function VaultDetectedStep({
  seed,
  ownerAddress,
  onUseAnotherOwner,
  onVaultConnected,
}: Props): JSX.Element {
  const wallet = useWallet();
  const vault = useVault();
  const { notificationAdded } = useNotifications();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const connect = async () => {
    try {
      const owner: Owner = {
        identifier: ownerAddress,
        seed,
        timestamp: Date.now(),
      };
      const isConnected = await vault.connect(owner);
      if (isConnected) {
        onVaultConnected();
      } else {
        //Vault must exist, it's tested in the previous step
        throw new Error();
      }
    } catch (e) {
      Sentry.captureException(e);
      console.error(e);
      notificationAdded({
        text: "En error occurred, please clean your cache and refresh your page.",
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (wallet.activeAddress !== ownerAddress) {
      onUseAnotherOwner();
    }
  }, [wallet.activeAddress, ownerAddress, onUseAnotherOwner]);

  return (
    <Container>
      <VaultAccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <Top>
        <Title>Vault detected</Title>
        <Text>
          {getMinimalIdentifier(wallet.activeAddress)} is already the Owner of a
          Vault. A wallet can only be the owner of one Vault at once.
        </Text>
        <VaultAccess onClick={() => setIsModalOpen(true)}>
          Vault Access
          <Question size={12.31} weight={"bold"} />
        </VaultAccess>
      </Top>
      <Bottom>
        <Button
          style={{
            marginBottom: 10,
            width: "100%",
          }}
          onClick={() => connect()}
          primary
        >
          Connect to my Vault
        </Button>
        <Button
          style={{
            width: "100%",
          }}
          onClick={async () => {
            await wallet.disconnect({ label: wallet.connected.label });
            onUseAnotherOwner();
          }}
        >
          Use another wallet
        </Button>
      </Bottom>
    </Container>
  );
}
