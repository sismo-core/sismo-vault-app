type Environment = {
  name: "LOCAL" | "DEMO" | "PROD_BETA" | "STAGING_BETA";
  sentryReleaseName: string;
  disabledSentry: boolean;
  vaultURL: string;
  factoryApiUrl: string;
  hubApiUrl: string;
  commitmentMapperUrl?: string;
  githubOauthClientId?: string;
  sismoDestination: {
    address: string;
    sec: number;
    commitmentMapperPubKey: [string, string];
    commitmentReceipt: [string, string, string];
  };
};

(window as any).env.sentryReleaseName = process.env.REACT_APP_GIT_HASH;
let env = (window as any).env as Environment;

export default env;
