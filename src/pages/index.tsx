import { BrowserRouter, Route, Routes } from "react-router-dom";
import Notifications from "../components/Notifications";
import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { useImportAccount } from "./Modals/ImportAccount/provider";
import ImportAccountModal from "./Modals/ImportAccount";
import MyVaultModal from "./Modals/MyVault";
import { useVault } from "../libs/vault";
import { useMyVault } from "./Modals/MyVault/Provider";
import GenerateRecoveryKeyModal from "./Modals/GenerateRecoveryKey";
import Redirect from "./Redirect";
import AlphaNotification from "../components/ZikiNotification";
import Connect from "./Connect";
import ConnectVaultModal from "./Modals/ConnectVaultModal";
import Home from "./Home";
import { Navigate } from "react-router-dom";

import { getMockUrl } from "./Connect/mockRequest";

export default function Pages(): JSX.Element {
  const [githubCode, setGithubCode] = useState(null);
  const [twitterOauth, setTwitterOauth] = useState(null);
  const importAccount = useImportAccount();
  const vault = useVault();
  const { open: openMyVault } = useMyVault();

  const [connectIsOpen, setConnectIsOpen] = useState(false);

  useEffect(() => {
    const html: any = document.getElementsByTagName("HTML")[0];
    html.style.overflowX = "hidden";
  }, [vault.isConnected]);

  const myVaultIsOpen = useRef<Boolean>(false);

  getMockUrl();

  /*********************************************************/
  /************************ MY VAULT ***********************/
  /*********************************************************/

  useEffect(() => {
    if (vault.loadingActiveSession) return;
    if (!vault.isConnected) return;
    if (myVaultIsOpen.current === true) return;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const _vault = urlParams.get("myVault");
    if (_vault) {
      myVaultIsOpen.current = true;
      openMyVault(_vault);
    }
  }, [vault.isConnected, vault.loadingActiveSession, openMyVault]);

  /*********************************************************/
  /*********************  WEB2 ACCOUNT *********************/
  /*********************************************************/

  /***********************  GITHUB *************************/

  useEffect(() => {
    if (!vault.isConnected) return;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const _code = urlParams.get("code");
    if (_code) {
      const _redirected = urlParams.get("redirected");
      if (!_redirected) {
        // twitter redirection
        if (localStorage.getItem("redirect_uri_github")) {
          const splitRedirectUri = localStorage
            .getItem("redirect_uri_github")
            .split("?");
          localStorage.removeItem("redirect_uri_github");
          window.location.href = `${splitRedirectUri[0]}?${
            splitRedirectUri[1] + "&"
          }code=${_code}&redirected=true`;
        }
        return;
      }

      const referrer = localStorage.getItem("redirect_referrer_github");
      Object.defineProperty(document, "referrer", {
        get: function () {
          return referrer;
        },
      });
      localStorage.removeItem("redirect_referrer_github");

      const url = new URL(window.location.href);
      url.searchParams.delete("redirected");
      window.history.replaceState(null, "New url", url);
      setGithubCode(_code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vault.isConnected]);

  useEffect(() => {
    if (githubCode) {
      importAccount.open({
        importType: "account",
        accountTypes: ["github"],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [githubCode]);

  useEffect(() => {
    if (!importAccount.isOpen) {
      setGithubCode(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importAccount.isOpen]);

  /***********************  TWITTER *************************/

  useEffect(() => {
    if (!vault.isConnected) return;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const _oauthToken = urlParams.get("oauth_token");
    if (_oauthToken) {
      const _oauthVerifier = urlParams.get("oauth_verifier");
      const _redirected = urlParams.get("redirected");

      if (!_redirected) {
        // twitter redirection
        if (localStorage.getItem("redirect_uri_twitter")) {
          const splitRedirectUri = localStorage
            .getItem("redirect_uri_twitter")
            .split("?");
          localStorage.removeItem("redirect_uri_twitter");
          window.location.href = `${splitRedirectUri[0]}?${
            splitRedirectUri[1] + "&"
          }oauth_token=${_oauthToken}&oauth_verifier=${_oauthVerifier}&redirected=true`;
        }
        return;
      }

      const referrer = localStorage.getItem("redirect_referrer_twitter");
      Object.defineProperty(document, "referrer", {
        get: function () {
          return referrer;
        },
      });
      localStorage.removeItem("redirect_referrer_twitter");

      const url = new URL(window.location.href);
      url.searchParams.delete("redirected");
      window.history.replaceState(null, "New url", url);
      setTwitterOauth({
        oauthToken: _oauthToken,
        oauthVerifier: _oauthVerifier,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vault.isConnected]);

  useEffect(() => {
    if (twitterOauth) {
      importAccount.open({
        importType: "account",
        accountTypes: ["twitter"],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [twitterOauth]);

  useEffect(() => {
    if (!importAccount.isOpen) {
      setTwitterOauth(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importAccount.isOpen]);

  return (
    <>
      <BrowserRouter>
        {/* Modals */}
        <ImportAccountModal
          githubCode={githubCode}
          twitterOauth={twitterOauth}
        />
        <ConnectVaultModal
          isOpen={connectIsOpen}
          onClose={() => setConnectIsOpen(false)}
        />

        {!(window as any).localStorage.getItem("alpha-notif-first-time") &&
          (window as any).innerWidth > 900 &&
          window.location.pathname !== "/prove" && (
            <AlphaNotification
              onClose={() =>
                !(window as any).localStorage.setItem(
                  "alpha-notif-first-time",
                  true
                )
              }
            />
          )}
        <MyVaultModal />
        <GenerateRecoveryKeyModal />
        {/* Detect if the environment is correct and align with onchain data*/}
        <Notifications />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/connect" element={<Connect />} />

          <Route path="/redirect" element={<Redirect />} />

          <Route
            path="*"
            element={<Navigate to={`/connect`} replace={true} />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}
