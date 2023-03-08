import "./App.css";
import Pages from "./pages";
import Theme from "./theme";
import NotificationsProvider from "./components/Notifications/provider";
import { useEffect, useState } from "react";
import * as Sentry from "@sentry/react";
import env from "./environment";
import WalletProvider from "./libs/wallet";
import SismoVaultProvider from "./libs/vault";
import SismoProvider from "./libs/sismo";
import MyVaultModalProvider from "./pages/Modals/MyVault/Provider";
import ImportAccountModalProvider from "./pages/Modals/ImportAccount/provider";
import GenerateRecoveryKeyModalProvider from "./pages/Modals/GenerateRecoveryKey/provider";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import MainScrollManagerProvider from "./libs/main-scroll-manager";
import EnvsMonitoring from "./libs/envs-monitoring";
import { SismoClient } from "./libs/sismo-client";
import { IndexDbCache } from "./libs/sismo-client/caches/indexdb-cache";

// const IMAGES = [
//   "/flows/masquerade/logo.png",
//   "/assets/logoV2.svg",
//   "/assets/arrow.svg",
//   "/assets/badge/disabled.svg",
//   "/assets/badge/success.png",
//   "/assets/badge/default.png",
//   "/assets/badge/hovered.svg",
//   "/assets/badge/notHovered.svg",
//   "/assets/sismo-vault-green.svg",
//   "/assets/sismo-vault.svg",
//   "/assets/sismo-vault-v2.svg",
//   "/icons/key-outline-lightBlue.svg",
//   "/icons/arrowDown-outline-lightBlue.svg",
//   "/icons/arrowLeft-outline-white.svg",
//   "/icons/badge-fill-lightBlue.svg",
//   "/icons/badge-fill-blue4.svg",
//   "/icons/check-outline-blue.svg",
//   "/icons/check-outline-white.svg",
//   "/icons/confirmNotif-outline-blue.svg",
//   "/icons/cross-outline-blue.svg",
//   "/icons/cross-outline-white.svg",
//   "/icons/edit-outline-blue.svg",
//   "/icons/externalLink-outline-white.svg",
//   "/icons/gear-outline-blue.svg",
//   "/icons/info-outline-lightblue.svg",
//   "/icons/key-fill-blue.svg",
//   "/icons/key-outline-green.svg",
//   "/icons/key-outline-lightBlue.svg",
//   "/icons/key-outline-white.svg",
//   "/icons/plus-outline-white.svg",
//   "/icons/settings-outline-lightBlue.svg",
//   "/icons/switch-outline-white.svg",
//   "/icons/switch-outline-blue.svg",
//   "/icons/warning-outline-orange.svg",
//   "/icons/back-outline-lightBlue.svg",
//   "/icons/externalLink-outline-white.svg",
//   "/icons/key-outline-green.svg",
//   "/icons/key-outline-white.svg",
//   "/icons/key-outline-lightBlue.svg",
//   "/icons/plus-outline-white.svg",
//   "/icons/check-outline-white.svg",
//   "/icons/check-outline-green.svg",
//   "/icons/warning-outline-orange.svg",
//   "/icons/edit-outline-blue.svg",
//   "/icons/switch-outline-white.svg",
//   "/icons/key-fill-blue.svg",
//   "/icons/switch-outline-blue.svg",
//   "/icons/smallArrowLeft-outline-white.svg",
//   "/icons/question-outline-white.svg",
//   "/icons/question-outline-lightBlue.svg",
//   "/icons/plus-outline-blue.svg",
//   "/icons/logoEthereum-fill-blue0.svg",
//   "/icons/logoEthereum-fill-blue3.svg",
//   "/icons/logoGithub-fill-blue0.svg",
//   "/icons/logoPolygon-fill-blue0.svg",
//   "/icons/logoPolygon-fill-blue3.svg",
//   "/icons/logoOpensea-fill-color.svg",
//   "/icons/logoSnapshot-fill-blue.svg",
//   "/icons/logoTwitter-fill-blue0.svg",
//   "/icons/logoTwitter-rounded-blue0.svg",
//   "/icons/arrowDown-outline-white.svg",
//   "/icons/playground-outline-green.svg",
//   "/icons/playground-outline-blue.svg",
//   "/icons/sismo-outline-white.svg",
//   "/icons/sources-outline-white.svg",
//   "/icons/destinations-outline-white.svg",
//   "/icons/settings-outline-white.svg",
//   "/icons/vault-outline-blue0.svg",
//   "/zikies/zikie-gold-blackened.svg",
//   "/zikies/zikie-gold-lightened.svg",
// ];

const FONTS_LIST = [
  "BebasNeuePro-Regular",
  "BebasNeuePro-Bold",
  "Inter-Light",
  "Inter-Regular",
  "Inter-SemiBold",
  "Inter-Bold",
  "Inter-Medium",
];

const sismoClient = new SismoClient({
  cache: new IndexDbCache(),
});

const removeHexadecimalNumbers = (event: Sentry.Event) => {
  const reg = /0x[a-fA-F0-9]+/g;
  const eventString = JSON.stringify(event);
  const eventHexadecimalNumbers = eventString.replace(reg, "0x??????");
  return JSON.parse(eventHexadecimalNumbers);
};

!env.disabledSentry &&
  Sentry.init({
    dsn: "https://ada3a7d1e0c148b09e6f8015949fb402@o1362988.ingest.sentry.io/6655193",
    integrations: [
      new Sentry.Integrations.Breadcrumbs({
        fetch: false,
        xhr: false,
      }),
    ],
    release: env.sentryReleaseName,
    ignoreErrors: [
      // Random plugins/extensions
      "top.GLOBALS",
      // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
      "originalCreateNotification",
      "canvas.contentDocument",
      "MyApp_RemoveAllHighlights",
      "http://tt.epicplay.com",
      "Can't find variable: ZiteReader",
      "jigsaw is not defined",
      "ComboSearch is not defined",
      "http://loading.retry.widdit.com/",
      "atomicFindClose",
      // Facebook borked
      "fb_xd_fragment",
      // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to
      // reduce this. (thanks @acdha)
      // See http://stackoverflow.com/questions/4113268
      "bmi_SafeAddOnload",
      "EBCallBackMessageReceived",
      // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
      "conduitPage",
    ],
    denyUrls: [
      // Facebook flakiness
      /graph\.facebook\.com/i,
      // Facebook blocked
      /connect\.facebook\.net\/en_US\/all\.js/i,
      // Woopra flakiness
      /eatdifferent\.com\.woopra-ns\.com/i,
      /static\.woopra\.com\/js\/woopra\.js/i,
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i,
      // Other plugins
      /127\.0\.0\.1:4001\/isrunning/i, // Cacaoweb
      /webappstoolbarba\.texthelp\.com\//i,
      /metrics\.itunes\.apple\.com\.edgesuite\.net\//i,
    ],
    environment: env.name,
    tracesSampleRate: 1.0,
    beforeSend(event) {
      return removeHexadecimalNumbers(event);
    },
  });

function App() {
  const [, setImgsLoaded] = useState(false);

  useEffect(() => {
    // const loadImage = (image) => {
    //   return new Promise((resolve, reject) => {
    //     const loadImg = new Image();
    //     loadImg.src = image;
    //     // wait 2 seconds to simulate loading time
    //     loadImg.onload = () =>
    //       setTimeout(() => {
    //         resolve(image);
    //       }, 2000);
    //     loadImg.onerror = (err) => reject(err);
    //   });
    // };

    const loadFonts = (font: string) => {
      return new Promise((resolve, reject) => {
        document.fonts
          .load(`12px ${font}`)
          .then(() => {
            resolve(font);
          })
          .catch((err) => console.log("Failed to load fonts", err));
      });
    };

    Promise.all(FONTS_LIST.map((font) => loadFonts(font)));
    // Promise.all(IMAGES.map((image) => loadImage(image)))
    //   .then(() => setImgsLoaded(true))
    //   .catch((err) => console.log("Failed to load images", err));
  }, []);

  return (
    <MainScrollManagerProvider>
      <WalletProvider>
        <SismoVaultProvider vaultUrl={env.vaultURL}>
          <NotificationsProvider>
            <SismoProvider client={sismoClient}>
              <GenerateRecoveryKeyModalProvider>
                <MyVaultModalProvider>
                  <ImportAccountModalProvider>
                    <EnvsMonitoring>
                      <Theme>
                        <Pages />
                      </Theme>
                    </EnvsMonitoring>
                  </ImportAccountModalProvider>
                </MyVaultModalProvider>
              </GenerateRecoveryKeyModalProvider>
            </SismoProvider>
          </NotificationsProvider>
        </SismoVaultProvider>
      </WalletProvider>
    </MainScrollManagerProvider>
  );
}

export default App;
