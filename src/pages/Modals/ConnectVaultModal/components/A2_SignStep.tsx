import { useState } from "react";
import styled from "styled-components";
import Button from "../../../../components/Button";
import OwnerDetails from "../../../../components/OwnerDetails";
import { useWallet } from "../../../../hooks/wallet";
import { useVault } from "../../../../hooks/vault";
import { Owner } from "../../../../services/vault-client";
import { Seed } from "../../../../services/sismo-client";
import { useNotifications } from "../../../../components/Notifications/provider";
import colors from "../../../../theme/colors";
import Logo, { LogoType } from "../../../../components/Logo";
import { ArrowsLeftRight } from "phosphor-react";
import * as Sentry from "@sentry/react";

const Container = styled.div`
  width: 400px;
  height: 450px;
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

  margin-bottom: 20px;
`;

const Bottom = styled.div`
  width: 252px;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: center;
`;

const SwitchWallet = styled.div`
  align-self: flex-end;
  display: flex;
  align-items: center;
  gap: 5px;

  font-size: 14px;
  line-height: 20px;
  color: ${(props) => props.theme.colors.blue0};
  font-family: ${(props) => props.theme.fonts.medium};
  cursor: pointer;
`;
type SignStepProps = {
  onSwitchAddress: () => void;
  onNoVault: (seed: string, ownerAddress: string) => void;
  onVaultConnected: () => void;
  onLoading: (loading: boolean) => void;
  onCancel: () => void;
};

export default function SignStep({
  onSwitchAddress,
  onNoVault,
  onVaultConnected,
  onLoading,
  onCancel,
}: SignStepProps): JSX.Element {
  const [loading, setLoading] = useState(false);
  const wallet = useWallet();
  const vault = useVault();
  const { notificationAdded } = useNotifications();

  const signToConnect = async () => {
    if (!wallet || !wallet.activeAddress) return;
    setLoading(true);
    onLoading(true);
    let ownerAddress = wallet.activeAddress;
    try {
      const _seedSignature = await wallet.sign(Seed.getSeedMsg(ownerAddress));
      if (_seedSignature) {
        const seed = await Seed.generateSeed(_seedSignature);
        const owner: Owner = {
          identifier: ownerAddress,
          seed,
          timestamp: Date.now(),
        };

        const isConnected = await vault.connect(owner);
        if (isConnected) {
          onVaultConnected();
        } else {
          onNoVault(seed, ownerAddress);
          return;
        }
      }
    } catch (e) {
      Sentry.captureException(e);
      console.error(e);
      notificationAdded({
        text: "En error occurred, please clean your cache and refresh your page.",
        type: "error",
      });
    }
    onLoading(false);
    setLoading(false);
  };

  return (
    <Container>
      <Top>
        <Title>Access Sismo Vault</Title>
        <Text>
          Sign the message in your wallet to access your Sismo Vault with{" "}
          {wallet.activeMainMinified}
        </Text>
        <Logo
          type={LogoType.VAULTONBOARDING}
          color={colors.blue0}
          secondaryColor={colors.blue11}
          size={115}
        />
        <OwnerDetails
          address={wallet.activeAddress}
          main={wallet.activeMainMinified}
          subtitle={"Connected account"}
        />
      </Top>
      <Bottom>
        <Button
          style={{
            marginTop: 10,
            marginBottom: 10,
            width: "100%",
          }}
          onClick={() => signToConnect()}
          primary
          loading={loading}
        >
          {loading ? "Sign message..." : "Sign message"}
        </Button>
        <SwitchWallet onClick={() => onSwitchAddress()}>
          <ArrowsLeftRight size={21.22} />
          Switch wallet
        </SwitchWallet>
      </Bottom>
    </Container>
  );
}
