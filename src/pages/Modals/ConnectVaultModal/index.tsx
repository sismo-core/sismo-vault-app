import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import Modal from "../../../components/Modal";
import AccessOrCreateStep from "./components/0_AccessOrCreateStep";
import SignStep from "./components/A2_SignStep";
import VaultNotFound from "./components/A3_VaultNotFoundStep";
import { useWallet } from "../../../hooks/wallet";
import * as Sentry from "@sentry/react";
import { useVault } from "../../../hooks/vault";
import CreateVaultStep from "./components/B1_CreateVaultStep";
import ConnectWalletStep from "./components/A1_ConnectStep";
import AccessRecoveryKey from "./components/AccessRecoveryKey";
import VaultDetectedStep from "./components/B2_VaultDetectedStep";
import { useGenerateRecoveryKey } from "../GenerateRecoveryKey/provider";

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
`;

type ConnectVaultModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ConnectVaultModal({
  isOpen,
  onClose,
}: ConnectVaultModalProps): JSX.Element {
  const [step, setStep] = useState("AccessOrCreateStep");
  const [loading, setLoading] = useState(false);
  const [seed, setSeed] = useState(null);
  const [ownerAddress, setOwnerAddress] = useState(null);
  const [switchingWallet, setSwitchingWallet] = useState(false);
  const [onboardIsOpen, setOnboardIsOpen] = useState(false);
  const wallet = useWallet();
  const generateRecoveryKey = useGenerateRecoveryKey();
  const vault = useVault();

  useEffect(() => {
    if (isOpen) {
      setStep("AccessOrCreateStep");
    }
  }, [isOpen]);

  const cancel = useCallback(async () => {
    if (wallet && wallet.connected) {
      try {
        await wallet.disconnect({ label: wallet.connected.label });
      } catch (e) {
        console.error(e);
        Sentry.captureException(e, {
          extra: {
            disconnectWallet: "connectVaultModal",
          },
        });
      }
    }
    onClose();
  }, [wallet, onClose]);

  useEffect(() => {
    if (!isOpen) {
      if (!vault.isConnected) {
        setTimeout(() => {
          cancel();
        }, 300);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const switchWallet = async () => {
    setSwitchingWallet(true);
    const connectedWallet = await wallet.connect({});
    if (connectedWallet) {
      setStep("signStep");
    }
    setSwitchingWallet(false);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        blur={step === "switchActiveTuto" || loading}
        animated
        outsideClosable={!switchingWallet && !onboardIsOpen}
      >
        <Content>
          {step === "AccessOrCreateStep" && (
            <AccessOrCreateStep
              onConnect={() => setStep("connectStep")}
              onCreateVault={() => setStep("createVaultStep")}
            />
          )}
          {step === "connectStep" && (
            <ConnectWalletStep
              onWalletOnboard={(_loading) => {
                setOnboardIsOpen(_loading);
              }}
              onConnected={() => {
                setStep("signStep");
              }}
              onRecoveryKey={() => setStep("AccessRecoveryKey")}
            />
          )}
          {step === "AccessRecoveryKey" && <AccessRecoveryKey onConnected={() => onClose()} />}
          {step === "signStep" && (
            <SignStep
              onSwitchAddress={() => switchWallet()}
              onNoVault={(seed, _ownerAddress) => {
                setSeed(seed);
                setOwnerAddress(_ownerAddress);
                setStep("vaultNotFoundStep");
              }}
              onVaultConnected={() => onClose()}
              onLoading={(_loading) => setLoading(_loading)}
              onCancel={() => cancel()}
            />
          )}
          {step === "vaultNotFoundStep" && (
            <VaultNotFound
              onCreate={() => {
                setStep("createVaultStep");
              }}
              onRetrieve={() => {
                setStep("AccessOrCreateStep");
              }}
            />
          )}
          {step === "createVaultStep" && (
            <CreateVaultStep
              onOnboardIsOpen={(_loading) => {
                setOnboardIsOpen(_loading);
              }}
              onVaultDetected={(seed, identifier) => {
                setSeed(seed);
                setOwnerAddress(identifier);
                setStep("vaultDetectedStep");
              }}
              onCreated={() => {
                onClose();
              }}
              onStoreKey={() => {
                generateRecoveryKey.open();
                onClose();
              }}
            />
          )}
          {step === "vaultDetectedStep" && (
            <VaultDetectedStep
              onUseAnotherOwner={() => setStep("createVaultStep")}
              seed={seed}
              ownerAddress={ownerAddress}
              onVaultConnected={() => onClose()}
            />
          )}
        </Content>
      </Modal>
    </>
  );
}
