//Docker compose up
window.env = {
  name: "LOCAL",
  chainIds: [31337],
  disabledMinting: false,
  disabledNullifier: false,
  disabledSentry: true,
  vaultURL: "https://vault-api.zikies.io",
  factoryApiUrl: "https://factory-api.staging.zikies.io",
  relayerEndpoints: {
    31337: ["http://127.0.0.1:8081"],
  },
  commitmentMapperUrl: "https://x5y521b36b.execute-api.eu-west-1.amazonaws.com",
  badgesApiUrl: "http://127.0.0.1:8000",
  hydraApiUrl: "http://127.0.0.1:8000",
  flowsApiUrl: "http://127.0.0.1:8000",
  synapsApiUrl: "https://pf7zm4g1q0.execute-api.eu-west-3.amazonaws.com",
  githubOauthClientId: "35b1e225b5f8f1401cc3",
  sismoSubGraphAPIUrls: {
    31337: "https://api.thegraph.com/subgraphs/name/yum0e/sismo-subgraph",
  },
  s3SubgraphAPIUrls: {
    31337: null,
  },
  contracts: {
    31337: {
      "AttestationsRegistry": {
        address: "0x3D7220043f746FA5a087cD53460D48a5C0990980",
        deploymentTxnHash:
          "0xc9a2816f2a183e55b044525ddfa84a1e3c36a48696d93d7ff498fe12fd306472",
      },
      "Badges": {
        address: "0xeF5b2Be9a6075a61bCA4384abc375485d5e196c3",
      },
      "HydraS1AccountboundAttester": {
        address: "0xa73a8094E303A823a8b64089fFD79913E76092cF",
      },
      "Pythia1SimpleAttester": {
        address: "0x28be8d370b08c349655c3df963da190fba77d59c",
      },
      "Front": {
        address: "0x7f1624094ACe6cd9653A8c3C3D92F2fAbb241B07",
      },
      "FrontendLib": {
        address: "0xF280f6AB0E8e5737F1C88DACe25871b5cd5Dd76c",
      },
    },
  },
  rpc: {
    31337: {
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
