import styled from "styled-components";
import { CaretLeft, Gear, Copy } from "phosphor-react";
import { useRef } from "react";
import { useVault } from "../../../libs/vault";
import Avatar from "../../../components/Avatar";
import { getMainMinified } from "../../../utils/getMain";
import Loader from "../../../components/Loader";
import { useImportAccount } from "../../Modals/ImportAccount/provider";
import colors from "../../../theme/colors";
import { useMyVault } from "../../Modals/MyVault/Provider";
import { useNotifications } from "../../../components/Notifications/provider";
import { getMinimalIdentifier } from "../../../utils/getMinimalIdentifier";
import ThreeDotsLoader from "../../../components/ThreeDotsLoader";

const Container = styled.div<{ vaultSliderOpen: boolean }>`
  position: absolute;
  top: 50px;
  left: 592px;
  display: flex;

  z-index: 1;
  box-sizing: border-box;

  @media (max-width: 1180px) {
    // left: 500px;
  }
  @media (max-width: 900px) {
    display: none;
  }
`;

const VaultButton = styled.div<{ vaultSliderOpen: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  width: 44px;
  height: 67px;
  gap: 10px;

  border-radius: 5px;
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  background-color: ${(props) => props.theme.colors.blue11};
  cursor: pointer;
  transform: translateX(
    ${(props) => (props.vaultSliderOpen ? "-8px" : "-296px")}
  );
  transition: transform 0.1s ease-in-out;

  @media (max-width: 1180px) {
    transform: translateX(
      ${(props) => (props.vaultSliderOpen ? "-8px" : "-196px")}
    );
  }
`;

const VaultIconWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 27.3px;
  height: 26.97px;
  margin-top: 10px;
  margin-left: 12px;
`;

const VaultIcon = styled.img`
  width: 22px;
  height: 23px;
`;

const AccountsNumber = styled.div<{
  isTwoDigits: boolean;
}>`
  position: absolute;
  bottom: 0px;
  right: 0px;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 13px;
  height: 13px;

  background-color: ${(props) => props.theme.colors.blue0};
  color: ${(props) => props.theme.colors.blue11};

  font-size: ${(props) => (props.isTwoDigits ? "8px" : "8px")};
  line-height: 12px;
  font-family: ${(props) => props.theme.fonts.medium};
  border-radius: 50%;

  box-sizing: border-box;
`;

const CaretWrapper = styled.div<{ vaultSliderOpen: boolean }>`
  display: flex;
  align-items: center;
  align-self: flex-end;
  margin-right: 13.36px;

  transform: rotateY(${(props) => (props.vaultSliderOpen ? "0deg" : "180deg")});

  transition: transform 0.1s ease-in-out;
`;

const VaultContent = styled.div<{
  isConnected: boolean;
  vaultSliderOpen: boolean;
}>`
  overflow: hidden;
  white-space: nowrap;

  width: 288px;
  transform: translateX(
    ${(props) => (props.vaultSliderOpen ? "0px" : "-288px")}
  );

  border-radius: 5px;
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  background-color: ${(props) => props.theme.colors.blue11};

  display: flex;
  flex-direction: column;
  gap: 10px;

  box-sizing: border-box;

  transition: transform 0.1s ease-in-out;
  /* z-index: -1; */

  @media (max-width: 1180px) {
    width: 188px;
    ${(props) => (props.vaultSliderOpen ? "0px" : "-188px")}
  }
`;

const VaultTitle = styled.div<{ vaultSliderOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${(props) => props.theme.colors.blue0};
  font-family: ${(props) => props.theme.fonts.medium};
  font-size: 16px;
  line-height: 22px;
  padding: 20px 20px 15px 20px;

  transition: opacity 0.2s;
`;

const GearWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const VaultList = styled.div<{ vaultSliderOpen: boolean }>`
  display: ${(props) => (props.vaultSliderOpen ? "block" : "none")};
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: ${(props) => props.theme.colors.blue10};
  border-radius: 5px;
  align-items: flex-start;
  margin: 0px 10px 10px 10px;
  overflow-x: hidden;

  max-height: 210px;
  overflow-y: scroll;

  /* width */
  ::-webkit-scrollbar {
    width: 5px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: #1b2947;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #2a3557;
    border-radius: 20px;
    cursor: pointer;
    width: 5px;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
  }
`;

const AccountLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 5px 10px 10px;
  gap: 10px;
  box-sizing: border-box;
`;

const AccountLineImporting = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 10px;
  gap: 10px;
  box-sizing: border-box;
`;

const AvatarName = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const CopyWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const AvatarWrapper = styled.div<{
  vaultSliderOpen: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 21px;
  height: 21px;
`;

const LoaderWrapper = styled.div<{ vaultSliderOpen: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 21px;
  height: 21px;
`;

const AccountName = styled.div<{ vaultSliderOpen: boolean }>`
  font-family: ${(props) => props.theme.fonts.medium};
  font-size: 14px;
  line-height: 20px;
  color: ${(props) => props.theme.colors.blue0};
`;

const AccountImporting = styled.div`
  font-family: ${(props) => props.theme.fonts.medium};
  font-size: 14px;
  line-height: 20px;
  font-style: italic;
  color: ${(props) => props.theme.colors.blue0};
`;

const VaultNotConnected = styled.div<{ vaultSliderOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  text-align: center;
  width: 100%;
  font-size: 12px;
  line-height: 20px;

  color: ${(props) => props.theme.colors.blue2};
  user-select: none;
`;

const ProofLoaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 14px;
  padding: 10px 0 20px 0;

  box-sizing: border-box;
`;

const ProofLoaderText = styled.div`
  font-size: 14px;
  line-height: 20px;
  font-family: ${(props) => props.theme.fonts.medium};
  color: ${(props) => props.theme.colors.blue0};
  font-style: italic;
`;

type Props = {
  proofLoading?: boolean;
  vaultSliderOpen: boolean;
  setVaultSliderOpen: (value: boolean) => void;
};

export default function VaultSlider({
  proofLoading = false,
  vaultSliderOpen,
  setVaultSliderOpen,
}: Props): JSX.Element {
  const ref = useRef(null);

  const vault = useVault();
  const importAccount = useImportAccount();
  const myVault = useMyVault();

  // useOnClickOutside(ref, () => {
  //   setVaultSliderOpen(false);
  // });

  const { notificationAdded } = useNotifications();

  const copy = (identifier: string) => {
    navigator.clipboard.writeText(identifier);
    notificationAdded({
      text: `${getMinimalIdentifier(identifier)} copied in your clipboard!`,
      type: "success",
    });
  };

  return (
    <Container ref={ref} vaultSliderOpen={vaultSliderOpen}>
      <VaultContent
        isConnected={vault?.isConnected}
        vaultSliderOpen={vaultSliderOpen}
      >
        <VaultTitle vaultSliderOpen={vaultSliderOpen}>
          {vault.vaultName ? vault.vaultName : "Your Sismo vault"}
          <GearWrapper
            onClick={() => vault?.isConnected && myVault?.open("accounts")}
          >
            <Gear size={20} color={colors.blue0} />
          </GearWrapper>
        </VaultTitle>
        {!vault?.isConnected && (
          <VaultNotConnected vaultSliderOpen={vaultSliderOpen}>
            you are not connected
          </VaultNotConnected>
        )}
        {vault?.isConnected &&
          vault?.importedAccounts?.length === 0 &&
          importAccount.importing !== "account" && (
            <VaultNotConnected vaultSliderOpen={vaultSliderOpen}>
              no imported accounts
            </VaultNotConnected>
          )}

        {vault?.isConnected &&
          (vault?.importedAccounts?.length > 0 ||
            importAccount.importing === "account") && (
            <VaultList vaultSliderOpen={vaultSliderOpen}>
              {vault?.importedAccounts?.map((source, index) => (
                <AccountLine key={source.identifier + index}>
                  <AvatarName>
                    <AvatarWrapper vaultSliderOpen={vaultSliderOpen}>
                      <Avatar
                        account={source}
                        style={{ width: "100%", height: "100%" }}
                        width={21}
                      />
                    </AvatarWrapper>

                    <AccountName vaultSliderOpen={vaultSliderOpen}>
                      {getMainMinified(source)}
                    </AccountName>
                  </AvatarName>

                  <CopyWrapper>
                    <Copy
                      size={12}
                      color={colors.blue0}
                      onClick={() => copy(source.identifier)}
                    />
                  </CopyWrapper>
                </AccountLine>
              ))}
              {importAccount.importing === "account" && (
                <AccountLineImporting>
                  <LoaderWrapper vaultSliderOpen={vaultSliderOpen}>
                    <Loader size={16} />
                  </LoaderWrapper>
                  <AccountImporting>ImportingAccount...</AccountImporting>
                </AccountLineImporting>
              )}
            </VaultList>
          )}
        {proofLoading && (
          <ProofLoaderWrapper>
            <ThreeDotsLoader />
            <ProofLoaderText>generating Zk Proof...</ProofLoaderText>
          </ProofLoaderWrapper>
        )}
      </VaultContent>

      <VaultButton
        vaultSliderOpen={vaultSliderOpen}
        onClick={() => setVaultSliderOpen(!vaultSliderOpen)}
      >
        <VaultIconWrapper>
          <VaultIcon src="/assets/sismo-vault.svg" alt="vault" />

          <AccountsNumber isTwoDigits={vault?.importedAccounts?.length > 9}>
            {vault?.importedAccounts?.length
              ? vault?.importedAccounts?.length
              : 0}
          </AccountsNumber>
        </VaultIconWrapper>

        <CaretWrapper vaultSliderOpen={vaultSliderOpen}>
          <CaretLeft size={10.58} weight="bold" color={colors?.blue0} />
        </CaretWrapper>
      </VaultButton>
    </Container>
  );
}
