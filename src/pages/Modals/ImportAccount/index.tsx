import { useEffect, useState } from "react";
import styled from "styled-components";
import colors from "../../../theme/colors";
import Modal from "../../../components/Modal";
import Account from "./components/Account";
import ImportEthereum from "./Ethereum";
import ImportGithub from "./Github";
import { zIndex } from "../../../theme/z-index";
import { useWallet } from "../../../libs/wallet";
import { useImportAccount } from "./provider";
import ImportTwitter from "./Twitter";
import env from "../../../environment";

const Content = styled.div`
  display: flex;
  flex-direction: column;
  padding: 30px;
  max-width: 460px;
`;

const Title = styled.div`
  color: ${colors.blue0};
  font-size: 20px;
  line-height: 20px;
`;

const Accounts = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 20px;
  max-width: 460px;
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    max-width: 260px;
  }
`;

export interface ImportingAccount {
  isSource: boolean;
  isDestination: boolean;
  isOwner: boolean;
}

type ImportAccountModalProps = {
  githubCode: string;
  twitterOauth: { oauthToken: string; oauthVerifier: string };
};

export default function ImportAccountModal({
  githubCode,
  twitterOauth,
}: ImportAccountModalProps): JSX.Element {
  const [blur, setBlur] = useState(false);
  const [outsideClosable, setOutsideClosable] = useState(true);
  const wallet = useWallet();
  const [display, setDisplay] = useState<
    "choice" | "ethereum" | "github" | "twitter"
  >(null);
  const { isOpen, importType, accountTypes, close } = useImportAccount();

  //Select the right flow to display
  useEffect(() => {
    if (!isOpen) {
      setBlur(false);
      setDisplay(null);
      return;
    }
    if (env.name === "DEMO") {
      setDisplay("ethereum");
      return;
    }

    if (
      importType === "owner" ||
      (accountTypes &&
        accountTypes.length === 1 &&
        accountTypes[0] === "ethereum")
    ) {
      setDisplay("ethereum");
      return;
    }

    if (
      accountTypes &&
      accountTypes.length === 1 &&
      accountTypes[0] === "github"
    ) {
      setDisplay("github");
      return;
    }

    if (
      accountTypes &&
      accountTypes.length === 1 &&
      accountTypes[0] === "twitter"
    ) {
      setDisplay("twitter");
      return;
    }
    setDisplay("choice");
  }, [accountTypes, importType, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (wallet.isConnected) return;
    if (display !== "ethereum") return;
    const connectWallet = async () => {
      const connectedWallet = await wallet.connect({});
      if (!connectedWallet) {
        close();
      }
    };
    connectWallet();
  }, [
    wallet.isConnected,
    accountTypes,
    importType,
    wallet,
    display,
    close,
    isOpen,
  ]);

  if (!wallet.isConnected && display === "ethereum") return <></>;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => close()}
      blur={blur}
      animated
      outsideClosable={outsideClosable}
      zIndex={zIndex.importAccountModal}
    >
      {display === "ethereum" && (
        <ImportEthereum
          onBackgroundBlur={(_blur) => setBlur(_blur)}
          onOutsideClickable={(_outsideCLosable) =>
            setOutsideClosable(_outsideCLosable)
          }
        />
      )}
      {display === "github" && (
        <ImportGithub code={githubCode} isOpen={isOpen} />
      )}
      {display === "twitter" && (
        <ImportTwitter oauth={twitterOauth} isOpen={isOpen} />
      )}

      {display === "choice" && (
        <Content>
          <Title style={{ marginBottom: 30 }}>Import account</Title>
          <Accounts>
            {accountTypes ? (
              <>
                {accountTypes.includes("ethereum") && (
                  <Account
                    type={"ethereum"}
                    onClick={() => setDisplay("ethereum")}
                  />
                )}
                <Account type={"github"} onClick={() => setDisplay("github")} />
                {accountTypes.includes("twitter") && (
                  <Account
                    type={"twitter"}
                    onClick={() => setDisplay("twitter")}
                  />
                )}
              </>
            ) : (
              <>
                <Account
                  type={"ethereum"}
                  onClick={() => setDisplay("ethereum")}
                />
                <Account type={"github"} onClick={() => setDisplay("github")} />
                <Account
                  type={"twitter"}
                  onClick={() => setDisplay("twitter")}
                />
              </>
            )}
          </Accounts>
        </Content>
      )}
    </Modal>
  );
}
