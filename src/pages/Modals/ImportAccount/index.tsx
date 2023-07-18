import { useEffect, useState } from "react";
import styled from "styled-components";
import colors from "../../../theme/colors";
import Modal from "../../../components/Modal";
import Account from "./components/Account";
import ImportEthereum from "./Ethereum";
import ImportGithub from "./Github";
import { zIndex } from "../../../theme/z-index";
import { useWallet } from "../../../hooks/wallet";
import { useImportAccount } from "./provider";
import ImportTelegram from "./Telegram";
import ImportTwitter from "./Twitter";
import env from "../../../environment";
import { useVault } from "../../../hooks/vault";
import { featureFlagProvider } from "../../../utils/featureFlags";
import { clearQueryParams } from "../../../utils/clearQueryParams";
import { clearLocationHash } from "../../../utils/clearLocationHash";
import { getTwitterCallbackURL } from "../../../utils/navigateOAuth";

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
  isImpersonated: boolean;
};

export default function ImportAccountModal({
  isImpersonated,
}: ImportAccountModalProps): JSX.Element {
  const [blur, setBlur] = useState(false);
  const [outsideClosable, setOutsideClosable] = useState(true);
  const wallet = useWallet();
  const [display, setDisplay] = useState<"choice" | "ethereum" | "github" | "twitter" | "telegram">(
    null
  );
  const { isOpen, importType, accountTypes, close, open } = useImportAccount();
  const [githubCode, setGithubCode] = useState(null);
  const [telegramPayload, setTelegramPayload] = useState(null);
  const [twitterOauth, setTwitterOauth] = useState(null);
  const [twitterV2Oauth, setTwitterV2Oauth] = useState(null);
  const vault = useVault();

  //Select the right flow to display
  useEffect(() => {
    if (!isOpen) {
      setBlur(false);
      setDisplay(null);
      return;
    }
    if (env.name === "DEMO" || isImpersonated) {
      setDisplay("ethereum");
      return;
    }

    if (
      importType === "owner" ||
      (accountTypes && accountTypes.length === 1 && accountTypes[0] === "ethereum")
    ) {
      setDisplay("ethereum");
      return;
    }

    if (accountTypes && accountTypes.length === 1 && accountTypes[0] === "github") {
      setDisplay("github");
      return;
    }

    if (accountTypes && accountTypes.length === 1 && accountTypes[0] === "twitter") {
      setDisplay("twitter");
      return;
    }

    if (accountTypes && accountTypes.length === 1 && accountTypes[0] === "telegram") {
      setDisplay("telegram");
      return;
    }
    setDisplay("choice");
  }, [accountTypes, importType, isOpen, isImpersonated]);

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
  }, [wallet.isConnected, accountTypes, importType, wallet, display, close, isOpen]);

  /*********************************************************/
  /*********************  WEB2 ACCOUNTS ********************/
  /*********************************************************/

  /***********************  TELEGRAM *************************/
  useEffect(() => {
    if (!vault.isConnected) return;
    const urlParams = new URLSearchParams(window.location.search);
    const isGithubCallback = urlParams.get("callback_source") === "telegram";
    if (!isGithubCallback) return;

    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const payload = hashParams.get("tgAuthResult");
    clearQueryParams("callback_source");
    clearLocationHash();

    setTelegramPayload(payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vault.isConnected]);

  useEffect(() => {
    if (telegramPayload) {
      open({
        importType: "account",
        accountTypes: ["telegram"],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telegramPayload]);

  useEffect(() => {
    if (!isOpen) {
      setTelegramPayload(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /***********************  GITHUB *************************/
  useEffect(() => {
    if (!vault.isConnected) return;
    const urlParams = new URLSearchParams(window.location.search);
    const isGithubCallback = urlParams.get("callback_source") === "github";
    if (!isGithubCallback) return;

    const code = urlParams.get("code");
    clearQueryParams("callback_source", "code");

    setGithubCode(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vault.isConnected]);

  useEffect(() => {
    if (githubCode) {
      open({
        importType: "account",
        accountTypes: ["github"],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [githubCode]);

  useEffect(() => {
    if (!isOpen) {
      setGithubCode(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /***********************  TWITTER v1 *************************/
  useEffect(() => {
    if (!vault.isConnected) return;
    if (featureFlagProvider.isTwitterV2Enabled()) return;
    const urlParams = new URLSearchParams(window.location.search);
    const isTwitterV1Callback = urlParams.get("callback_source") === "twitter-v1";
    if (!isTwitterV1Callback) return;

    const oauthToken = urlParams.get("oauth_token");
    const oauthVerifier = urlParams.get("oauth_verifier");
    clearQueryParams("callback_source", "oauth_token", "oauth_verifier");

    setTwitterOauth({
      oauthToken: oauthToken,
      oauthVerifier: oauthVerifier,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vault.isConnected]);

  useEffect(() => {
    if (twitterOauth) {
      open({
        importType: "account",
        accountTypes: ["twitter"],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [twitterOauth]);

  useEffect(() => {
    if (!isOpen) {
      setTwitterOauth(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /***********************  TWITTER v2 *************************/
  useEffect(() => {
    if (!vault.isConnected) return;
    if (!featureFlagProvider.isTwitterV2Enabled()) return;
    const urlParams = new URLSearchParams(window.location.search);
    const isTwitterV2Redirect = urlParams.get("callback_source") === "twitter-v2";
    if (!isTwitterV2Redirect) return;

    const code = urlParams.get("code");
    clearQueryParams("code", "state", "callback_source");

    setTwitterV2Oauth({
      callback: getTwitterCallbackURL(),
      twitterCode: code,
    });
    // eslint-disabl  e-next-line react-hooks/exhaustive-deps
  }, [vault.isConnected]);

  useEffect(() => {
    if (twitterV2Oauth) {
      open({
        importType: "account",
        accountTypes: ["twitter"],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [twitterV2Oauth]);

  useEffect(() => {
    if (!isOpen) {
      setTwitterV2Oauth(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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
          onOutsideClickable={(_outsideCLosable) => setOutsideClosable(_outsideCLosable)}
        />
      )}
      {display === "github" && <ImportGithub code={githubCode} />}
      {display === "twitter" && <ImportTwitter oauth={twitterOauth} oauthV2={twitterV2Oauth} />}
      {display === "telegram" && <ImportTelegram payload={telegramPayload} />}

      {display === "choice" && (
        <Content>
          <Title style={{ marginBottom: 30 }}>Import account</Title>
          <Accounts>
            {accountTypes ? (
              <>
                {accountTypes.includes("ethereum") && (
                  <Account type={"ethereum"} onClick={() => setDisplay("ethereum")} />
                )}
                {accountTypes.includes("github") && (
                  <Account type={"github"} onClick={() => setDisplay("github")} />
                )}
                {accountTypes.includes("twitter") && (
                  <Account type={"twitter"} onClick={() => setDisplay("twitter")} />
                )}
                {featureFlagProvider.isTelegramEnabled() && accountTypes.includes("telegram") && (
                  <Account type={"telegram"} onClick={() => setDisplay("telegram")} />
                )}
              </>
            ) : (
              <>
                <Account type={"ethereum"} onClick={() => setDisplay("ethereum")} />
                <Account type={"github"} onClick={() => setDisplay("github")} />
                <Account type={"twitter"} onClick={() => setDisplay("twitter")} />
                {featureFlagProvider.isTelegramEnabled() && (
                  <Account type={"telegram"} onClick={() => setDisplay("telegram")} />
                )}
              </>
            )}
          </Accounts>
        </Content>
      )}
    </Modal>
  );
}
