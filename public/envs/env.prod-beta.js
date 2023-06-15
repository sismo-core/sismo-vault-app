// https://vault-beta.sismo.io/
window.env = {
  name: "PROD_BETA",
  disabledSentry: false,
  featureFlags: {
    telegram: true,
    twitterV2: true,
  },
  mintingAppUrl: "https://app.sismo.io",
  vaultV2URL: "https://vault-beta-api.sismo.io",
  vaultV1URL: "https://vault-api.sismo.io",
  hubApiUrl: "https://hub.sismo.io",
  factoryApiUrl: "https://factory-api.sismo.io",
  commitmentMapperUrlV2: "https://httqvtidxi.execute-api.eu-west-1.amazonaws.com",
  commitmentMapperUrlV1: "https://sibgc1bwn8.execute-api.eu-west-1.amazonaws.com",
  githubOauthClientId: "ed165a166320d0676ccb",
  telegramBotId:"6040785698",
  chainName: "gnosis",
  sismoDestination: {
    address: "0x0000000000000000000000000000000000515110",
    sec: 515110,
    commitmentMapperPubKey: [
      "0x07f6c5612eb579788478789deccb06cf0eb168e457eea490af754922939ebdb9",
      "0x20706798455f90ed993f8dac8075fc1538738a25f0c928da905c0dffd81869fa",
    ],
    commitmentReceipt: [
      "0x2345a306a80dcbf995265d6dfcd19e2e747ed07324578c509f4d8e214c4afb09",
      "0x24cfee70f84056f2d314f53c80369f512a130bea06c89a926f6f73456a473a04",
      "0x05f9c1765a0771cae354874d53ba951ade82040278f5d58f09e9dea00a24f3b2",
    ],
  },
};
