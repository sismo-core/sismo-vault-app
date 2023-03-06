//testnets.zikies.io
window.env = {
  name: "TESTNETS_PRIVATE",
  chainIds: [5, 80001],
  disabledMinting: false,
  disabledNullifier: false,
  disabledSentry: false,
  vaultURL: "https://vault-api.zikies.io",
  factoryApiUrl: "https://factory-api.staging.zikies.io",
  relayerEndpoints: {
    5: [
      "https://api.defender.openzeppelin.com/autotasks/e7e32c18-634d-447e-b931-516226683076/runs/webhook/b4340068-6b9e-453b-809e-5f861121c806/XmjxMWb7xrGoKMsQuSxkVq",
    ],
    80001: [
      "https://api.defender.openzeppelin.com/autotasks/3e7eda9e-d4df-4a7c-85ff-0863b11c9d5d/runs/webhook/b4340068-6b9e-453b-809e-5f861121c806/2RKoDc8i18dDbJL6FQMGyg",
    ],
  },
  commitmentMapperUrl: "https://x5y521b36b.execute-api.eu-west-1.amazonaws.com",
  badgesApiUrl: "https://hub.staging.zikies.io",
  hydraApiUrl: "https://hub.staging.zikies.io",
  flowsApiUrl: "https://hub.staging.zikies.io",
  synapsApiUrl: "https://pf7zm4g1q0.execute-api.eu-west-3.amazonaws.com",
  githubOauthClientId: "35b1e225b5f8f1401cc3",
  sismoSubGraphAPIUrls: {
    5: "https://subgraphs-staging-goerli.zikies.io/subgraphs/name/sismo-core/sismo-staging-goerli",
    80001:
      "https://subgraphs-staging-mumbai.zikies.io/subgraphs/name/sismo-core/sismo-staging-mumbai",
  },
  s3SubgraphAPIUrls: {
    5: "https://subgraphs-staging-cache-data.s3.eu-west-1.amazonaws.com/sismo-staging-goerli",
    80001:
      "https://subgraphs-staging-cache-data.s3.eu-west-1.amazonaws.com/sismo-staging-mumbai",
  },
  contracts: {
    5: {
      "AttestationsRegistry": {
        address: "0xf85BA0afA375495eE625910Db61b6b1406756234",
        deploymentTxnHash:
          "0x521fc780b97210af6e47ce07818a758632d2ea21237ed2f700606342e2c3d018",
      },
      "Badges": {
        address: "0xE06B14D5835925e1642d7216F4563a1273509F10",
      },
      "HydraS1AccountboundAttester": {
        address: "0x89d80C9E65fd1aC8970B78A4F17E2e772030C1cB",
      },
      "Pythia1SimpleAttester": {
        address: "0x8E44f33Df343EA6f85380226BE5Fbf93db09168E",
      },
      "Front": {
        address: "0xAa00539FCD89E113833a9fCb940F378aE1299e30",
      },
      "FrontendLib": {
        address: "0x692B275E6f40E72eEacDE156daB73240B82Dd91f",
      },
    },
    80001: {
      "AttestationsRegistry": {
        address: "0xf576E42E5b2682B8f606B1840c3A982610C29a3f",
        deploymentTxnHash:
          "0xe5d46301c5952f0b32bfa41dfa0b381473ae3b333b935c3ae490a28b7d7ff8cc",
      },
      "Badges": {
        address: "0x5722fEa81027533721BA161964622271560da1aC",
      },
      "HydraS1AccountboundAttester": {
        address: "0x069e6B99f4DA543156f66274FC6673442803C587",
      },
      "Pythia1SimpleAttester": {
        address: "0x1586190051bf7bb0b754A7AA7CDde21E920ad009",
      },
      "Front": {
        address: "0xFD0395fEb7805447e84Eb439a543413ecb22d562",
      },
      "FrontendLib": {
        address: "0x299DDFdE5f62Abb56D2f3Dd8b42E525494e5455B",
      },
    },
  },
  rpc: {
    5: {
      overrideUrl: null,
      logsLimit: 2000,
    },
    80001: {
      overrideUrl: null,
      logsLimit: 2000,
    },
  },
  sismoDestination: {
    address: "0x0000000000000000000000000000000000515110",
    sec: 515110,
    commitmentMapperPubKey: [
      "0x1e468ad0fcde4edec429cd41eb28a0e78d4f31fa2c25172ef677468b2b38a9dc",
      "0x2b6e9a8e3b8ed419cca51e2e2ee7ae07d2902454deca17d7da7b00ae4a798add",
    ],
    commitmentReceipt: [
      "0x2345a306a80dcbf995265d6dfcd19e2e747ed07324578c509f4d8e214c4afb09",
      "0x24cfee70f84056f2d314f53c80369f512a130bea06c89a926f6f73456a473a04",
      "0x05f9c1765a0771cae354874d53ba951ade82040278f5d58f09e9dea00a24f3b2",
    ],
  },
};
