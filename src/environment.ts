type Environment = {
  name: "LOCAL" | "DEMO" | "STAGING_BETA" | "PROD_BETA" | "DEV_BETA";
  sentryReleaseName: string;
  disabledSentry: boolean;
  vaultV2URL: string;
  vaultV1URL: string;
  factoryApiUrl: string;
  hubApiUrl: string;
  commitmentMapperUrl?: string;
  githubOauthClientId?: string;
  chainName?: string;
  sismoDestination: {
    address: string;
    sec: number;
    commitmentMapperPubKey: [string, string];
    commitmentReceipt: [string, string, string];
  };
};

if ((window as any).env) {
  (window as any).env.sentryReleaseName = process.env.REACT_APP_GIT_HASH;
}
let env = (window as any).env as Environment;

export default env;
