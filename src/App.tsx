import "./App.css";
import Pages from "./pages";
import Theme from "./theme";
import NotificationsProvider from "./components/Notifications/provider";
import { useEffect } from "react";
import * as Sentry from "@sentry/react";
import env from "./environment";
import WalletProvider from "./hooks/wallet";
import SismoVaultProvider from "./hooks/vault";
import SismoProvider from "./hooks/sismo";
import MyVaultModalProvider from "./pages/Modals/MyVault/Provider";
import ImportAccountModalProvider from "./pages/Modals/ImportAccount/provider";
import GenerateRecoveryKeyModalProvider from "./pages/Modals/GenerateRecoveryKey/provider";
import MainScrollManagerProvider from "./libs/main-scroll-manager";
import EnvsMonitoring from "./libs/envs-monitoring";
import { ServicesFactory } from "./libs/services-factory";
import AnalyticsProvider from "./libs/analytics/Provider";
import { SismoErrorService } from "@sismo-core/sismo-error-service-private";

const FONTS_LIST = [
  "BebasNeuePro-Regular",
  "BebasNeuePro-Bold",
  "Inter-Light",
  "Inter-Regular",
  "Inter-SemiBold",
  "Inter-Bold",
  "Inter-Medium",
];

const services = ServicesFactory.init({
  env,
});

// TODO REFACTOR THIS TO AVOID THIS GLOBAL VARIABLE AND USE A CONTEXT INSTEAD WITH HOOKS TO ACCESS SERVICES
const isImpersonated = services.getVaultConfigParser().get()?.vault?.impersonate?.length > 0;

const removeEthAddresses = (event: ErrorEvent) => {
  const reg = /0x[a-fA-F0-9]{40}/g;
  const eventString = JSON.stringify(event);
  const eventHexadecimalNumbers = eventString.replace(reg, "0x??????");
  return JSON.parse(eventHexadecimalNumbers);
};

!env.disabledSentry &&
  SismoErrorService.init({
    dsn: "https://715ab6b127b4455b83e5849bd4c3a5e9@o1362988.ingest.sentry.io/4504838094323712",
    integrations: [
      new Sentry.Integrations.Breadcrumbs({
        fetch: false,
        xhr: false,
      }),
    ],
    normalizeDepth: 10,
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
      return removeEthAddresses(event as ErrorEvent);
    },
  });

function App() {
  useEffect(() => {
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
  }, []);

  // services from the factoryService to SismoProvider and vaultProvider

  return (
    <AnalyticsProvider>
      <MainScrollManagerProvider>
        <WalletProvider>
          <NotificationsProvider>
            <SismoVaultProvider services={services} isImpersonated={isImpersonated}>
              <SismoProvider services={services}>
                <GenerateRecoveryKeyModalProvider>
                  <MyVaultModalProvider>
                    <ImportAccountModalProvider>
                      <EnvsMonitoring isImpersonated={isImpersonated}>
                        <Theme>
                          <Pages isImpersonated={isImpersonated} />
                        </Theme>
                      </EnvsMonitoring>
                    </ImportAccountModalProvider>
                  </MyVaultModalProvider>
                </GenerateRecoveryKeyModalProvider>
              </SismoProvider>
            </SismoVaultProvider>
          </NotificationsProvider>
        </WalletProvider>
      </MainScrollManagerProvider>
    </AnalyticsProvider>
  );
}

export default App;
