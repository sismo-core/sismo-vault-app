import styled from "styled-components";
import Icon from "../Icon";
import Loader from "../Loader";
import { useEffect, useRef, useState } from "react";
import { getMainMinified } from "../../utils/getMain";
import { useMyVault } from "../../pages/Modals/MyVault/Provider";
import { useVault } from "../../hooks/vault";
import Avatar from "../Avatar";

const Container = styled.div<{ isOpen: boolean }>`
  display: flex;
  flex-direction: column;
  width: 243px;

  transition: all 0.4s;

  @media (min-width: 901px) {
    ${(props) =>
      !props.isOpen &&
      `
          transform: translate(-240px, 0px);
      `}
    ${(props) =>
      props.isOpen &&
      `
          transform: translate(0px, 0px);
      `}
  }

  @media (max-width: 900px) {
    ${(props) =>
      props.isOpen &&
      `
          transform: translate(-240px, 0px);
      `}
    ${(props) =>
      !props.isOpen &&
      `
          transform: translate(0px, 0px);
      `}
  }
`;

const Header = styled.div<{ isOpen: boolean }>`
  padding: 15px;
  width: calc(100% - 30px);
  border-radius: 0px 0px 0px 0px;
  display: flex;
  justify-content: space-between;
  justify-content: center;
  background-color: #13203d;
  color: white;
  font-size: 14px;
`;

const Title = styled.div`
  width: 100%;
  font-size: 16px;
`;

const ImportedAccounts = styled.div<{
  isOpen: boolean;
}>`
  display: flex;
  flex-direction: column;
  border-radius: 0px 5px 5px 5px;
  background-color: #1c2847;
  width: 100%;
  align-items: center;
  padding: 5px 0px;
`;

const ImportedAccountsContainer = styled.div`
  background-color: #13203d;
  padding: 0px 10px 10px 10px;
  border-radius: 0px 0px 5px 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(100% - 20px);
  @media (max-width: 900px) {
    border-radius: 0px 0px 0px 5px;
  }
`;

const Scroll = styled.div`
  overflow-y: auto;
  max-height: 300px;
  width: calc(100% - 8px);

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

const Account = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-size: 14px;
  padding: 10px;
`;

const NoAccounts = styled.div`
  font-size: 12px;
  color: #d0d7fb;
  width: calc(100% - 20px);
  text-align: center;
  padding: 13px 10px;
`;

const Tongue = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 45px;
  position: absolute;
  right: -45px;
  border-radius: 0px 5px 5px 0px;
  padding: 13px 0px;
  cursor: pointer;
  background-color: #13203d;

  @media (max-width: 900px) {
    left: -43px;
    border-radius: 5px 0px 0px 5px;
  }
`;

const LoadingText = styled.div`
  margin-left: 8px;
  font-size: 14px;
  font-style: italic;
  font-family: ${(props) => props.theme.fonts.regular};
`;

const Settings = styled.div`
  cursor: pointer;
`;

const Info = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const IconArrow = styled.div<{ isOpen: boolean }>`
  width: 16px;
  height: 16px;

  @media (min-width: 901px) {
    transform: ${(props) => (props.isOpen ? "rotate(90deg)" : "rotate(-90deg)")};
  }
  @media (max-width: 900px) {
    transform: ${(props) => (props.isOpen ? "rotate(-90deg)" : "rotate(90deg)")};
  }
`;

const AccountsNumber = styled.div`
  position: absolute;
  top: 28px;
  right: 5px;
  width: 13px;
  height: 13px;
  border-radius: 13px;
  background-color: #e9ecff;
  color: #13203d;
  font-size: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

type Props = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  importingAccount: "account" | "owner";
};

export default function MyVaultOverview({
  isOpen,
  onOpen,
  onClose,
  importingAccount,
}: Props): JSX.Element {
  const vault = useVault();
  const myVault = useMyVault();
  const [importedAccount, setImportedAccount] = useState(null);
  const scroll = useRef<HTMLDivElement>();

  useEffect(() => {
    if (importingAccount !== null) {
      setImportedAccount(!importingAccount);
      setTimeout(() => {
        setImportedAccount(null);
      }, 3000);
    }
  }, [importingAccount, isOpen]);

  useEffect(() => {
    if (!scroll.current) return;
    if (importedAccount) return;
    scroll.current.scroll({
      top: scroll.current.scrollHeight,
      behavior: "smooth",
    });
  }, [importedAccount, scroll]);

  return (
    <>
      <Container isOpen={isOpen}>
        <Header isOpen={isOpen}>
          <Title>My Sismo vault</Title>
          <Settings onClick={() => myVault.open("accounts")}>
            <Icon name="gear-outline-blue" style={{ width: 20 }} />
          </Settings>
        </Header>
        <Tongue onClick={() => (isOpen ? onClose() : onOpen())}>
          <img
            alt="Sismo vault"
            src={"/assets/sismo-vault.svg"}
            style={{ width: 24, height: 24, marginBottom: 16 }}
          />
          {vault && vault.importedAccounts && (
            <AccountsNumber>{vault.importedAccounts.length}</AccountsNumber>
          )}
          <IconArrow isOpen={isOpen}>
            <Icon name="arrowDown-outline-lightBlue" />
          </IconArrow>
        </Tongue>
        <ImportedAccountsContainer>
          <ImportedAccounts isOpen={isOpen}>
            {(vault && vault.importedAccounts && vault.importedAccounts.length > 0) ||
            importingAccount ? (
              <Scroll ref={scroll}>
                {vault.importedAccounts &&
                  vault.importedAccounts.map((account) => {
                    return (
                      <Account title={account.identifier} key={account.identifier}>
                        <Info>
                          <Avatar account={account} style={{ marginRight: 8 }} width={21} />
                          {getMainMinified(account)}
                        </Info>
                      </Account>
                    );
                  })}

                {importingAccount && (
                  <Account>
                    <Info style={{ marginLeft: 4 }}>
                      <Loader size={11} />
                      <LoadingText>Importing...</LoadingText>
                    </Info>
                    <div />
                  </Account>
                )}
              </Scroll>
            ) : (
              <NoAccounts>No imported accounts</NoAccounts>
            )}
          </ImportedAccounts>
        </ImportedAccountsContainer>
      </Container>
    </>
  );
}
