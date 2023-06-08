import { useEffect, useMemo, useState } from "react";
import Button from "../../../../../components/Button";
import styled from "styled-components";
import Account from "../../../../../components/Account";
import Icon from "../../../../../components/Icon";
import HorizontalSteps from "../../../../../components/HorizontalSteps";
import { useWallet } from "../../../../../hooks/wallet";
import { useVault } from "../../../../../hooks/vault";
import { Seed } from "../../../../../libs/sismo-client";

const Top = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const Bottom = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const Middle = styled.div`
  margin-top: 25px;
  display: flex;
  justify-content: center;
`;

const SwitchButton = styled.div`
  color: white;
  display: flex;
  align-items: center;
  cursor: pointer;
  :hover {
    opacity: 0.8;
  }
`;

const Highlight = styled.span`
  color: #a0f2e0;
`;

const HoverAccount = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// const HoverContent = styled.div`
//   position: absolute;
//   background-color: #1f2b50;
//   padding: 15px;
//   border-radius: 5px;
//   font-size: 14px;
//   color: #e9ecff;
//   box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px -1px,
//     rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;

//   left: 160px;
//   z-index: 1;
//   width: 200px;

//   @media (max-width: 650px) {
//     left: auto;
//     bottom: -70px;
//   }
// `;

type GenerateAccountStepProps = {
  onImport: (
    address: string,
    seedSignature: string,
    ownershipSignature: string
  ) => void;
  onImportAnother: () => void;
  onLoading: (loading: boolean) => void;
  type: "account" | "owner";
};

export default function GenerateAccountStep({
  onImport,
  onLoading,
  onImportAnother,
  type,
}: GenerateAccountStepProps): JSX.Element {
  const vault = useVault();
  const [seedSignature, setSeedSignature] = useState(null);
  const [ownershipSignature, setOwnershipSignature] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const wallet = useWallet();

  const isAlreadyImported = useMemo(() => {
    const importedAccount =
      vault.importedAccounts &&
      vault.importedAccounts.find(
        (el) => el.identifier === wallet.activeAddress
      );
    return importedAccount;
  }, [wallet.activeAddress, vault.importedAccounts]);

  const isAlreadyOwner = useMemo(() => {
    const owner = vault.owners.find(
      (el) => el.identifier === wallet.activeAddress
    );
    return owner;
  }, [wallet.activeAddress, vault.owners]);

  useEffect(() => {
    if (address && wallet.activeAddress !== address) {
      setAddress(null);
      setSeedSignature(null);
      setOwnershipSignature(null);
      setStep(1);
    }
  }, [wallet.activeAddress, address]);

  // Step 1
  const signSeed = async () => {
    setLoading(true);
    onLoading(true);
    const _seedSignature = await wallet.sign(
      Seed.getSeedMsg(wallet.activeAddress)
    );
    onLoading(false);
    setLoading(false);
    if (_seedSignature) {
      setSeedSignature(_seedSignature);
      setAddress(wallet.activeAddress);
      if (type === "owner") {
        importAccount(_seedSignature, null);
      } else {
        setStep(2);
      }
    }
  };

  // Step 2
  const signOwnership = async () => {
    setLoading(true);
    onLoading(true);
    const ownershipSignature = await wallet.sign(
      vault.commitmentMapper.getOwnershipMsg(wallet.activeAddress)
    );
    onLoading(false);
    setLoading(false);
    if (ownershipSignature) {
      //setOwnershipSignature(ownershipSignature);
      importAccount(seedSignature, ownershipSignature);
      setStep(3);
    }
  };

  const importAccount = async (seedSignature, ownershipSignature) => {
    onImport(wallet.activeAddress, seedSignature, ownershipSignature);
  };

  useEffect(() => {
    if (type !== "owner") {
      if (isAlreadyImported) {
        setStep(3);
        return;
      }
      if (isAlreadyOwner) {
        setStep(2);
        return;
      }
      setStep(1);
    }
  }, [isAlreadyOwner, isAlreadyImported, type]);

  return (
    <>
      <Top>
        <HoverAccount>
          <Account
            address={wallet.activeAddress}
            main={wallet.activeMainMinified}
            subtitle={type === "owner" ? "Import as Owner" : "Import account"}
            state={type === "account" ? "primary" : null}
            isCenter
          />
        </HoverAccount>
      </Top>

      <Middle>
        {/*
            {isAlreadySource && !isAlreadyDestination && (
              <AlreadyText>
                This address has already been imported as a source.
              </AlreadyText>
            )}

            {isAlreadyDestination && !isAlreadySource && (
              <AlreadyText>
                This address has already been imported as a destination.
              </AlreadyText>
            )}

            {isAlreadyDestination && isAlreadySource && (
              <AlreadyText>
                This address is already a imported in your vault. You do not need to
                sign again.
              </AlreadyText>
            )}
          */}

        <HorizontalSteps
          stepsHover={
            type === "owner"
              ? [
                  <>
                    Generate Sismo Seed
                    <br />
                    <br />
                    This signature allows to generate the Sismo seed of this
                    account. This seed is used to encrypt and decrypt your vault
                    and required generate ZK proof.
                  </>,
                ]
              : [
                  <>
                    {(isAlreadyOwner && !isAlreadyImported) ||
                    isAlreadyImported ? (
                      <Highlight>Generate Sismo Seed</Highlight>
                    ) : (
                      <>Generate Sismo Seed</>
                    )}
                    {isAlreadyOwner && !isAlreadyImported && (
                      <>
                        <br />
                        <br />
                        <Highlight>
                          This account is already imported as Owner in your
                          vault. You don't have to generate again the seed of
                          this account.
                        </Highlight>
                      </>
                    )}
                    {isAlreadyImported && (
                      <>
                        <br />
                        <br />
                        <Highlight>
                          This account is already imported in your vault. You
                          don't have to sign again.
                        </Highlight>
                      </>
                    )}
                    <br />
                    <br />
                    This signature allows to generate the Sismo seed of this
                    account. This seed is used to encrypt and decrypt your vault
                    and required generate ZK proof.
                  </>,
                  <>
                    {isAlreadyImported ? (
                      <Highlight>Prove of ownership</Highlight>
                    ) : (
                      <>Prove of ownership</>
                    )}
                    {isAlreadyImported && (
                      <>
                        <br />
                        <br />
                        <Highlight>
                          This account is already imported in your vault. You
                          don't have to sign again.
                        </Highlight>
                      </>
                    )}
                    <br />
                    <br />
                    This signature is used to prove that you own the address
                    during the ZK Proof generation.
                  </>,
                ]
          }
          currentStep={step}
          style={{ marginBottom: 15 }}
        />
      </Middle>

      <Bottom>
        {step === 3 ? (
          <Button
            style={{
              width: "100%",
            }}
            onClick={() => importAccount(seedSignature, ownershipSignature)}
            success
          >
            Import {wallet.activeMainMinified}
          </Button>
        ) : (
          <>
            {type === "owner" ? (
              <Button
                style={{
                  width: "100%",
                }}
                loading={loading}
                onClick={() => signSeed()}
                primary
              >
                {loading ? "Sign message..." : "Sign message"}
              </Button>
            ) : (
              <>
                {step === 1 && (
                  <Button
                    style={{
                      width: "100%",
                    }}
                    loading={loading}
                    onClick={() => signSeed()}
                    primary
                  >
                    {loading ? "Sign message..." : "Sign message 1/2"}
                  </Button>
                )}
                {step === 2 && (
                  <Button
                    style={{
                      width: "100%",
                    }}
                    loading={loading}
                    onClick={() => signOwnership()}
                    primary
                  >
                    {loading ? "Sign message..." : "Sign message 2/2"}
                  </Button>
                )}
              </>
            )}
          </>
        )}
        <SwitchButton
          onClick={() => {
            onImportAnother();
          }}
          style={{ marginBottom: -15, marginTop: 10 }}
        >
          <Icon name="switch-outline-white" style={{ marginRight: 5 }} />
          Switch wallet
        </SwitchButton>
      </Bottom>
    </>
  );
}
