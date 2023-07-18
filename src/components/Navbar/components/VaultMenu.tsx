import { useRef, useState } from "react";
import styled from "styled-components";
import useOnClickOutside from "../../../utils/useClickOutside";
import Icon from "../../Icon";
import OwnerDetails from "../../OwnerDetails";
//import Button from "../../Button";
import { getMainMinified } from "../../../utils/getMain";
import { useMyVault } from "../../../pages/Modals/MyVault/Provider";
import { useVault } from "../../../hooks/vault";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;
`;

const Menu = styled.div<{ isOpen: boolean }>`
  ${(props) => props.isOpen && "background-color: #13203D;"}
  border-radius: 5px;
  position: relative;
  min-width: 182px;
  @media (max-width: 500px) {
    background-color: transparent;
    min-width: 40px;
  }
`;

const Header = styled.div<{ isOpen: boolean }>`
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: 0px 15px 0px 15px;
  cursor: pointer;
  background-color: #13203d; //#13203D;
  border-radius: 5px;

  ${(props) =>
    !props.isOpen &&
    `
    border-radius: 5px;
  `}

  @media (max-width: 800px) {
    height: 40px;
  }
  @media (max-width: 500px) {
    width: 20px;
    padding: 0px 10px;
  }
`;

const Rows = styled.div`
  background-color: #13203d;
  display: flex;
  flex-direction: column;
  padding-top: 3px;
  position: absolute;
  width: calc(100% - 10px);
  top: 45px;
  right: 0px;
  padding: 0px 5px 5px 5px;
  border-radius: 5px;
  @media (max-width: 800px) {
    top: 35px;
  }
  @media (max-width: 500px) {
    width: 25px;
    width: 210px;
    top: 45px;
  }
`;

const RowText = styled.div`
  color: #e9ecff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0px 10px 0px 17px;
  height: 40px;
  border-radius: 2px;

  transition: background-color 0.1s ease-in-out;

  :hover {
    background-color: ${(props) => props.theme.colors.blue10};
  }
`;

const VaultText = styled.div<{ isOpen: boolean }>`
  color: ${(props) => props.theme.colors.blue0};
  font-size: 16px;
  font-family: ${(props) => props.theme.fonts.medium};
  line-height: 22px;
  @media (max-width: 800px) {
    font-size: 14px;
  }
`;

const AccountName = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  @media (max-width: 500px) {
    display: none;
  }
`;

const LogoContainer = styled.div`
  width: 19px;
  height: 19px;
  @media (max-width: 800px) {
    width: 20px;
    height: 23px;
  }
`;

const OwnerContainer = styled.div`
  margin-top: 5px;
`;

type VaultMenuProps = {
  style?: React.CSSProperties;
};

export default function VaultMenu({ style }: VaultMenuProps): JSX.Element {
  const myVault = useMyVault();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  useOnClickOutside(ref, () => close());
  const vault = useVault();

  // const disconnect = () => {
  //   vault.disconnect();
  //   close();
  // };

  const close = () => {
    setIsOpen(false);
  };

  if (!vault.isConnected) return <></>;

  return (
    <Container ref={ref} style={style}>
      <Menu isOpen={isOpen}>
        <Header
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          isOpen={isOpen}
        >
          <LogoContainer>
            <Icon name="vault-outline-blue0" style={{ width: "100%", height: "100%" }} />
          </LogoContainer>
          <AccountName style={{ marginLeft: 10 }}>
            <VaultText isOpen={isOpen}>{vault.vaultName}</VaultText>
          </AccountName>
        </Header>
        {isOpen && (
          <>
            <Rows>
              {vault.connectedOwner.identifier && (
                <OwnerContainer>
                  <OwnerDetails
                    address={vault.connectedOwner.identifier}
                    main={getMainMinified(vault.connectedOwner)}
                    subtitle={"Connected owner"}
                  />
                </OwnerContainer>
              )}
              <RowText
                onClick={() => {
                  myVault.open("accounts");
                  setIsOpen(false);
                }}
                style={{ marginBottom: 5, marginTop: 5 }}
              >
                <Icon name="sources-outline-white" style={{ marginRight: 10 }} />
                Accounts
              </RowText>
              <RowText
                onClick={() => {
                  myVault.open("settings");
                  setIsOpen(false);
                }}
                style={{ marginBottom: 5, marginTop: 5 }}
              >
                <Icon name="settings-outline-white" style={{ marginRight: 10 }} />
                Settings
              </RowText>
              {/* <Button style={{ width: "100%" }} onClick={disconnect}>
                Disconnect
              </Button> */}
            </Rows>
          </>
        )}
      </Menu>
    </Container>
  );
}
