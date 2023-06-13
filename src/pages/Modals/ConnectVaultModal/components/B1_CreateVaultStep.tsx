import { useState, useEffect } from "react";
import styled from "styled-components";
import Button from "../../../../components/Button";
import colors from "../../../../theme/colors";
import Logo, { LogoType } from "../../../../components/Logo";
import { Question } from "phosphor-react";
import { useWallet } from "../../../../hooks/wallet";
import { useVault } from "../../../../hooks/vault";
import { useNotifications } from "../../../../components/Notifications/provider";
import { Owner } from "../../../../libs/vault-client";
import { CommitmentMapper, Seed } from "../../../../libs/sismo-client";
import VaultAccessModal from "./VaultAccessModal";
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

const VaultAccess = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  line-height: 18px;
  cursor: pointer;

  color: inherit;
  text-decoration: none;

  margin-top: 20px;

  @media (max-width: 800px) {
    display: none;
  }
`;

type SignStepProps = {
  onStoreKey: () => void;
  onVaultDetected: (signatureSeed: string, identifier: string) => void;
  onCreated: () => void;
  onOnboardIsOpen: (loading: boolean) => void;
};

export default function CreateVaultStep({
  onCreated,
  onVaultDetected,
  onStoreKey,
  onOnboardIsOpen,
}: SignStepProps): JSX.Element {
  const wallet = useWallet();
  const vault = useVault();
  const { notificationAdded } = useNotifications();
  const [connecting, setConnecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [status, setStatus] = useState<
    "idle" | "connecting" | "sign-seed" | "sign-ownership" | "creating-vault"
  >("idle");

  const connectWallet = async () => {
    onOnboardIsOpen(true);
    setConnecting(false);
    setStatus("connecting");
    const connectedWallet = await wallet.connect({});
    setTimeout(() => {
      onOnboardIsOpen(false);
    }, 300);
    if (connectedWallet) {
      setConnecting(true);
    } else {
      setStatus("idle");
    }
  };

  useEffect(() => {
    if (wallet.isConnected && connecting) {
      addSecureWallet(wallet.activeAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.isConnected, connecting]);

  const signToGenerateSeed = async (identifier: string): Promise<string> => {
    const _seedSignature = await wallet.sign(Seed.getSeedMsg(identifier));
    return await Seed.generateSeed(_seedSignature);
  };

  const signToOwnership = async (identifier: string): Promise<string> => {
    return await wallet.sign(
      vault.commitmentMapper.getOwnershipMsg(identifier)
    );
  };

  const create = async (
    ownershipSignature: string,
    seed: string,
    identifier: string
  ) => {
    const owner: Owner = {
      seed,
      identifier,
      timestamp: Date.now(),
    };

    await vault.create();
    await vault.addOwner(owner);

    const commitmentMapperSecret =
      CommitmentMapper.generateCommitmentMapperSecret(seed);

    const vaultSecret = await vault.getVaultSecret();

    const { commitmentReceipt, commitmentMapperPubKey } =
      await vault.commitmentMapper.getEthereumCommitmentReceipt(
        identifier,
        ownershipSignature,
        commitmentMapperSecret,
        vaultSecret
      );

    await vault.importAccount({
      identifier,
      seed,
      commitmentReceipt,
      commitmentMapperPubKey,
      type: "ethereum",
      timestamp: Date.now(),
    });

    await vault.connect(owner);
  };

  const addSecureWallet = async (identifier: string) => {
    try {
      setStatus("sign-seed");
      let seed = null;
      try {
        seed = await signToGenerateSeed(identifier);
      } catch (e) {
        Sentry.captureException(e);
        setStatus("idle");
        return;
      }
      const owner: Owner = {
        identifier,
        seed,
        timestamp: Date.now(),
      };
      const isVaultExist = await vault.isVaultExist(owner);
      if (isVaultExist) {
        onVaultDetected(seed, identifier);
        return;
      }
      setStatus("sign-ownership");
      let ownershipSignature = null;
      try {
        ownershipSignature = await signToOwnership(identifier);
      } catch (e) {
        Sentry.captureException(e);
        setStatus("idle");
        return;
      }
      setStatus("creating-vault");
      await create(ownershipSignature, seed, identifier);
      onCreated();
    } catch (e) {
      Sentry.withScope(function (scope) {
        scope.setLevel("fatal");
        Sentry.captureException(e);
      });
      console.error(e);
      setStatus("idle");
      notificationAdded({
        type: "error",
        text: "An error occurred, while importing new owner",
      });
    }
  };

  return (
    <Container>
      <VaultAccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <Top>
        <Title>Set up your first Vault Owner</Title>
        <Text>
          Only Vault Owners can access your Vault, make sure you will not lose
          your wallet.
        </Text>
        <Logo
          type={LogoType.VAULTONBOARDING}
          color={colors.blue0}
          secondaryColor={colors.blue11}
          size={115}
        />
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
          onClick={() => {
            if (wallet.isConnected && wallet.activeAddress) {
              addSecureWallet(wallet.activeAddress);
            } else {
              connectWallet();
            }
          }}
          primary
          loading={status !== "idle"}
        >
          {status === "idle"
            ? "Use secure wallet"
            : status === "connecting"
            ? "Connecting wallet..."
            : status === "sign-seed"
            ? "Signing... 1/2"
            : status === "sign-ownership"
            ? "Signing... 2/2"
            : status === "creating-vault"
            ? "Adding owner..."
            : ""}
        </Button>
        <Button
          style={{
            width: "100%",
          }}
          disabled={status !== "idle"}
          onClick={() => onStoreKey()}
        >
          Store recovery key
        </Button>
      </Bottom>
    </Container>
  );
}
