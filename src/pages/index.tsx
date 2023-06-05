import { BrowserRouter, Route, Routes } from "react-router-dom";
import Notifications from "../components/Notifications";
import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import ImportAccountModal from "./Modals/ImportAccount";
import MyVaultModal from "./Modals/MyVault";
import { useVault } from "../libs/vault";
import { useMyVault } from "./Modals/MyVault/Provider";
import GenerateRecoveryKeyModal from "./Modals/GenerateRecoveryKey";
import AlphaNotification from "../components/ZikiNotification";
import Connect from "./Connect";
import ConnectVaultModal from "./Modals/ConnectVaultModal";
import Home from "./Home";
import { getMockUrl } from "./Connect/mockRequest";

export default function Pages({
  isImpersonated,
}: {
  isImpersonated: boolean;
}): JSX.Element {

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
    const urlParams = new URLSearchParams(window.location.search);
    const _vault = urlParams.get("myVault");
    if (_vault) {
      myVaultIsOpen.current = true;
      openMyVault(_vault);
    }
  }, [vault.isConnected, vault.loadingActiveSession, openMyVault]);

  return (
    <>
      <BrowserRouter>
        {/* Modals */}

        <ImportAccountModal
          isImpersonated={isImpersonated}
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
          {/* <Route
            path="*"
            element={<Navigate to={`/connect`} replace={true} />}
          /> */}
        </Routes>
      </BrowserRouter>
    </>
  );
}
