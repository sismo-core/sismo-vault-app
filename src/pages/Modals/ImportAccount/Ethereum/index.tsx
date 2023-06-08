import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import SwitchActiveTutoStep from "./components/SwitchActiveTutoStep";
import GenerateAccount from "./components/GenerateAccountStep";
import AlreadyImported from "./components/AlreadyImportedStep";
import WhereIsAddressStep from "./components/WhereIsAddressStep";
import { useWallet } from "../../../../hooks/wallet";
import { useVault } from "../../../../hooks/vault";
import { useImportAccount } from "../provider";
import WrongImported from "./components/WrongImported";

const Content = styled.div`
  width: calc(320px - 64px);
  min-height: calc(260px - 80px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 32px;
`;

type Props = {
  onBackgroundBlur?: (blur: boolean) => void;
  onOutsideClickable?: (outsideClickable: boolean) => void;
};

export default function ImportEthereum({
  onBackgroundBlur,
  onOutsideClickable,
}: Props): JSX.Element {
  const importAccount = useImportAccount();
  const [step, setStep] = useState("none");
  const isInit = useRef<Boolean>();
  const wallet = useWallet();
  const vault = useVault();

  useEffect(() => {
    if (!importAccount.isOpen) {
      isInit.current = false;
      setStep("none");
    }
  }, [importAccount.isOpen]);

  useEffect(() => {
    if (step === "switchActiveTuto") {
      onBackgroundBlur(true);
    } else {
      onBackgroundBlur(false);
    }
  }, [step, onBackgroundBlur]);

  useEffect(() => {
    if (!wallet.activeAddress) return;
    let _step = "none";
    if (importAccount.isOpen) {
      const importedAccounts =
        vault.importedAccounts &&
        vault.importedAccounts.find(
          (account) => account.identifier === wallet.activeAddress
        );

      const owner =
        vault.owners &&
        vault.owners.find((owner) => owner.identifier === wallet.activeAddress);

      if (
        importAccount.importTarget &&
        wallet.activeAddress !== importAccount.importTarget
      ) {
        if (isInit.current) {
          _step = "wrongImported";
        } else {
          _step = "whereIsAddress";
          isInit.current = true;
        }
        setStep(_step);
        return;
      }

      if (
        !importAccount.importTarget &&
        owner &&
        importAccount.importType === "owner"
      ) {
        if (isInit.current) {
          _step = "alreadyImported";
        } else {
          _step = "whereIsAddress";
          isInit.current = true;
        }
        setStep(_step);
        return;
      }

      if (
        !importAccount.importTarget &&
        importedAccounts &&
        importAccount.importType === "account"
      ) {
        if (isInit.current) {
          _step = "alreadyImported";
        } else {
          _step = "whereIsAddress";
          isInit.current = true;
        }
        setStep(_step);
        return;
      }
      isInit.current = true;
      _step = "generate";
    }
    setStep(_step);
  }, [
    wallet.activeAddress,
    vault.importedAccounts,
    vault.owners,
    importAccount.isOpen,
    importAccount.importType,
    importAccount.importTarget,
  ]);

  const switchWallet = async () => {
    onOutsideClickable(false);
    const connectedWallet = await wallet.connect({});
    if (connectedWallet) {
      setStep("generate");
    }
    onOutsideClickable(true);
  };

  return (
    <>
      <Content>
        {step === "alreadyImported" && (
          <AlreadyImported onNext={() => setStep("whereIsAddress")} />
        )}
        {step === "wrongImported" && (
          <WrongImported
            onNext={() => setStep("whereIsAddress")}
            importTarget={importAccount.importTarget}
          />
        )}
        {step === "whereIsAddress" && (
          <WhereIsAddressStep
            onCurrentWallet={() => setStep("switchActiveTuto")}
            onOtherWallet={() => switchWallet()}
            importTarget={importAccount.importTarget}
          />
        )}
        {step === "switchActiveTuto" && (
          <SwitchActiveTutoStep
            onCancel={() => setStep("whereIsAddress")}
            importTarget={importAccount.importTarget}
          />
        )}
        {step === "generate" && (
          <GenerateAccount
            type={importAccount.importType}
            onImportAnother={() => setStep("whereIsAddress")}
            onImport={(address, seedSignature, ownershipSignature) => {
              setTimeout(
                () =>
                  importAccount.importEthereum(
                    address,
                    seedSignature,
                    ownershipSignature,
                    importAccount.importType
                  ),
                300
              );
              importAccount.close();
            }}
            onLoading={(_loading) => onBackgroundBlur(_loading)}
          />
        )}
      </Content>
    </>
  );
}
