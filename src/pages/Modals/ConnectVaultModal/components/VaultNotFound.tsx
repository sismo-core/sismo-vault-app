import { useEffect, useState } from "react";
import styled from "styled-components";
import { CommitmentMapper, Seed } from "../../../../libs/sismo-client";
import Button from "../../../../components/Button";
import { Text } from "../../../../components/Text";
import { useVault } from "../../../../libs/vault";
import { Owner } from "../../../../libs/vault-client";
import { useWallet } from "../../../../libs/wallet";
import { useNotifications } from "../../../../components/Notifications/provider";
//import Info from "../../Info";
import colors from "../../../../theme/colors";
import Icon from "../../../../components/Icon";
import HoverTooltip from "../../../../components/HoverTooltip";
import { Info } from "phosphor-react";
import * as Sentry from "@sentry/react";

const Container = styled.div`
  height: calc(450px - 70px);
  width: calc(400px - 60px);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.div`
  width: 100%;
  font-family: ${(props) => props.theme.fonts.medium};
  font-size: 20px;
  text-align: left;
  color: white;
`;

const Schema = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const ExternalLink = styled.div`
  color: ${colors.blue3};
  font-size: 12px;
  cursor: pointer;
`;

const Right = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;

type VaultNotFoundProps = {
  onCreated: () => void;
  onCancel: () => void;
  seedSignature: string;
  ownerAddress: string;
};

export default function VaultNotFound({
  ownerAddress,
  seedSignature,
  onCreated,
  onCancel,
}: VaultNotFoundProps): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [ownershipSignature, setOwnershipSignature] = useState(null);
  const vault = useVault();
  const wallet = useWallet();
  const { notificationAdded } = useNotifications();

  const create = async () => {
    setLoading(true);
    try {
      const _ownershipSignature = await wallet.sign(
        vault.commitmentMapper.getOwnershipMsg(wallet.activeAddress)
      );
      setOwnershipSignature(_ownershipSignature);
      const seed = await Seed.generateSeed(seedSignature);
      const owner: Owner = {
        seed,
        identifier: ownerAddress,
        timestamp: Date.now(),
      };
      await vault.createFromOwner(owner, "My Sismo vault");
      const commitmentMapperSecret =
        CommitmentMapper.generateCommitmentMapperSecret(seed);

      const mnemonic = await vault.getMnemonic(owner);
      const vaultSecret =
        CommitmentMapper.generateCommitmentMapperSecret(mnemonic);

      const { commitmentReceipt, commitmentMapperPubKey } =
        await vault.commitmentMapper.getEthereumCommitmentReceipt(
          ownerAddress,
          _ownershipSignature,
          commitmentMapperSecret,
          vaultSecret
        );
      await vault.connect(owner);
      await vault.importAccount(owner, {
        identifier: ownerAddress,
        seed,
        commitmentReceipt,
        commitmentMapperPubKey,
        type: "ethereum",
        timestamp: Date.now(),
      });
      setLoading(false);
      setOwnershipSignature(null);
    } catch (e) {
      Sentry.captureException(e);
      console.error(e);
      setLoading(false);
      setOwnershipSignature(null);
      notificationAdded({
        type: "error",
        text: "An error occurred while creating your vault",
      });
    }
  };

  useEffect(() => {
    if (vault.connectedOwner) {
      onCreated();
      setLoading(false);
    }
  }, [onCreated, vault]);

  return (
    <Container>
      <Title style={{ marginBottom: 20 }}>Create Sismo Vault</Title>
      <Schema style={{ marginBottom: 20 }}>
        <img src="/assets/vault-onboarding-schema.svg" alt="Vault schema" />
      </Schema>
      <Text style={{ position: "relative", marginBottom: 20 }}>
        Importing accounts into your Sismo Vault enables you to prove facts
        about your identity in a frictionless and privacy-preserving manner.{" "}
        <HoverTooltip
          width={310}
          text={
            <div style={{ width: 300 }}>
              <div style={{ marginBottom: 20 }}>
                Your Sismo Vault allows you to store cryptographic secrets
                derived from imported accounts.
              </div>
              <img
                src="/assets/sources-destinations-schema.svg"
                alt="Sources destinations schema"
                style={{ marginBottom: 30 }}
              />
              <div style={{ marginBottom: 15 }}>
                An{" "}
                <span style={{ color: colors.primary }}>Eligible account</span>{" "}
                is a private account that meets the requirements for minting a
                Badge.
              </div>
              <div style={{ marginBottom: 15 }}>
                A <span style={{ color: "#E2C488" }}>ZK Badge</span> is minted
                using ZK proofs generated in the Vault—leaving no links between
                your accounts.
              </div>
              <div>
                A <span style={{ color: "#A0F2E0" }}>Destination account</span>{" "}
                is the public account where you mint and use Badges.
              </div>
            </div>
          }
        >
          <Info size={12} color={"#E9ECFF"} weight="bold" />
        </HoverTooltip>
      </Text>
      <Text style={{ position: "relative" }}>
        You can generate ZK proofs and mint Badges from your Sismo Vault.
      </Text>
      <Right style={{ marginTop: 10 }}>
        <ExternalLink
          onClick={() =>
            window.open(
              "https://docs.sismo.io/sismo-docs/what-are-zk-badges",
              "_blank"
            )
          }
        >
          More about ZK Badges
          <Icon name="more-outline-blue2" style={{ marginLeft: 5 }} />
        </ExternalLink>
      </Right>
      <Button
        style={{
          marginTop: 20,
          width: 250,
        }}
        onClick={() => create()}
        loading={loading}
        primary
      >
        {loading
          ? ownershipSignature
            ? "Creating vault..."
            : "Sign message..."
          : "Create vault"}
      </Button>
    </Container>
  );
}
