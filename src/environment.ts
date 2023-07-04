import { RequestParams } from "@sismo-core/sismo-connect-client";

type FeatureFlags = {
  twitterV2?: boolean;
  telegram: boolean;
};

export type Environment = {
  name: "LOCAL" | "DEMO" | "STAGING_BETA" | "PROD_BETA" | "DEV_BETA";
  sentryReleaseName: string;
  disabledSentry: boolean;
  featureFlags?: FeatureFlags;
  vaultV2URL: string;
  vaultV1URL: string;
  factoryApiUrl: string;
  hubApiUrl: string;
  mintingAppUrl: string;
  commitmentMapperUrlV1?: string;
  commitmentMapperUrlV2?: string;
  githubOauthClientId?: string;
  telegramBotId?: string;
  chainName?: string;
  sismoDestination: {
    address: string;
    sec: number;
    commitmentMapperPubKey: [string, string];
    commitmentReceipt: [string, string, string];
  };
  walletConnectProjectId: string;
  sismoConnectDataSourcesConfig: SismoConnectDataSourceConfig[];
};

export type SismoConnectDataSourceConfig = {
  appId: string;
  type: string;
  request: RequestParams;
};

if ((window as any).env) {
  (window as any).env.sentryReleaseName = process.env.REACT_APP_GIT_HASH;
}
let env = (window as any).env as Environment;

export default env;
