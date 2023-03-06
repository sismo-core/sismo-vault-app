import { SupportedChainId } from "./libs/sismo-client";

type Environment = {
  name:
    | "LOCAL"
    | "STAGING"
    | "PLAYGROUND"
    | "PROD"
    | "TESTNETS_PRIVATE"
    | "TESTNETS";
  chainIds: SupportedChainId[];
  sentryReleaseName: string;
  disabledMinting: boolean;
  disabledNullifier: boolean;
  disabledSentry: boolean;
  vaultURL: string;
  factoryApiUrl: string;
  // Override SDK default URLs
  relayerEndpoints?: { [chainId: number]: string[] };
  commitmentMapperUrl?: string;
  badgesApiUrl?: string;
  hydraApiUrl?: string;
  synapsApiUrl?: string;
  flowsApiUrl?: string;
  githubOauthClientId?: string;
  sismoSubGraphAPIUrls?: string;
  synapsPubKey?: string[];
  s3SubgraphAPIUrls?: { [chainId: number]: string };
  contracts?: {
    [chainId: number]: {
      [name: string]: {
        address: string;
        deploymentTxnHash: string;
      };
    };
  };
  rpc?: {
    [chainId: number]: {
      urlOverride: string;
      logsLimit: number;
    };
  };
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
