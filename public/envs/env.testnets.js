//testnets.sismo.io
window.env = {
  name: "TESTNETS",
  chainIds: [5, 80001],
  disabledMinting: false,
  disabledNullifier: false,
  disabledSentry: false,
  vaultURL: "https://vault-api.sismo.io",
  factoryApiUrl: "https://factory-api.staging.zikies.io",
  relayerEndpoints: {
    5: [
      "https://api.defender.openzeppelin.com/autotasks/8d82fb96-c415-4566-ab2a-7ba86bfdb580/runs/webhook/b4340068-6b9e-453b-809e-5f861121c806/B4WarAGtvHhfXv4Q7ER4tT",
    ],
    80001: [
      "https://api.defender.openzeppelin.com/autotasks/03a2683b-4ed2-4df3-b671-6ab012251fe5/runs/webhook/b4340068-6b9e-453b-809e-5f861121c806/SyhJLHBujcCUKzpGtL2Egx",
    ],
  },
  commitmentMapperUrl: "https://sibgc1bwn8.execute-api.eu-west-1.amazonaws.com",
  badgesApiUrl: "https://hub.testnets.sismo.io",
  hydraApiUrl: "https://hub.testnets.sismo.io",
  flowsApiUrl: "https://hub.testnets.sismo.io",
  synapsApiUrl: "https://pf7zm4g1q0.execute-api.eu-west-3.amazonaws.com",
  githubOauthClientId: "ed165a166320d0676ccb",
  sismoSubGraphAPIUrls: {
    5: "https://subgraphs-sismo-goerli.sismo.io/subgraphs/name/sismo-core/sismo-goerli",
    80001:
      "https://subgraphs-sismo-mumbai.sismo.io/subgraphs/name/sismo-core/sismo-mumbai",
  },
  s3SubgraphAPIUrls: {
    5: "https://subgraphs-sismo-cache-data.s3.eu-west-1.amazonaws.com/sismo-goerli",
    80001:
      "https://subgraphs-sismo-cache-data.s3.eu-west-1.amazonaws.com/sismo-mumbai",
  },
  contracts: {
    5: {
      "AttestationsRegistry": {
        address: "0x7c0F3ba8e29ad7e28CA805933d6d43b35983B2b3",
        deploymentTxnHash:
          "0x94205a73e81e1bb351b61943021d981c5397abfc017e46503a150ffee60e6797",
      },
      "Badges": {
        address: "0xA251eb9Be4e7E2bb382268eCdd0a5fca0A962E6c",
      },
      "HydraS1AccountboundAttester": {
        address: "0x319d2a1f99DCE97bC1539643Df7cD7A0a978Eb7B",
      },
      "Pythia1SimpleAttester": {
        address: "0x65130b44f33E2E97Ea7031412eAFf7d5FC7bf9ad",
      },
      "Front": {
        address: "0x40713429614c47e94bC078069Df9C084fb44edfC",
      },
      "FrontendLib": {
        address: "0xCD2D88aE00583f33b49a1520e281B54746e8f8C0",
      },
    },
    80001: {
      "AttestationsRegistry": {
        address: "0xc24F86a8D9f82401b693d4FFaa1DCf3109d88524",
        deploymentTxnHash:
          "0x895bf0f687c521400bfd889873224e5349913bc833e6d87c7a6423c3897ed595",
      },
      "Badges": {
        address: "0xc3Ee5Aad6Fb987cF69a2EE7B3B2c92E21E42F34B",
      },
      "HydraS1AccountboundAttester": {
        address: "0xEe6c299A09d352caf53C81621f6D757c7C0B4d7c",
      },
      "Pythia1SimpleAttester": {
        address: "0xBbb56145d961742b1f3E3fc2b91077639C8C302a",
      },
      "Front": {
        address: "0xcAf720C39bcdF47476aDc0618e6d7B57B7533213",
      },
      "FrontendLib": {
        address: "0xBcEd04c8ecBB47250Ca8193bb7fAe0F1A9A0391F",
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
