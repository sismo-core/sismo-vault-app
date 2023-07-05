// https://vault-beta.zikies.io/
window.env = {
  name: "DEV_BETA",
  disabledSentry: false,
  featureFlags: {
    telegram: true,
    twitterV2: true,
  },
  mintingAppUrl: "https://testnets.zikies.io",
  vaultV2URL: "https://vault-beta-api.zikies.io",
  vaultV1URL: "https://vault-api.zikies.io",
  hubApiUrl: "https://hub.staging.zikies.io",
  factoryApiUrl: "https://factory-api.staging.zikies.io",
  commitmentMapperUrlV2: "https://p13gt0vnph.execute-api.eu-west-1.amazonaws.com",
  commitmentMapperUrlV1: "https://x5y521b36b.execute-api.eu-west-1.amazonaws.com",
  githubOauthClientId: "35b1e225b5f8f1401cc3",
  telegramBotId:"6011526037",
  chainName: "goerli",
  sismoDestination: {
    address: "0x0000000000000000000000000000000000515110",
    sec: 515110,
    commitmentMapperPubKey: [
      "0x1a443bff214ac92facdfc3970109c14a82a5d2cd145821815e2be893dcebb498",
      "0x1ab0875076678bbd098fabb491ef24096bb44e5ffe4e7f97859fbec050f48a6f"    
    ],
    commitmentReceipt: [
      "0x100691c4ac75b8431f65e2aeb4ba119c490db94b15eafcb5e6da0a4ada2cd18e",
      "0x1aad090e45ddcf9c3168349fd209dd525e21e2735f1755594ed472def7b3c1b9",
      "0x0173e6aa4b3226659d00b710f29ff0c087bb374b63d813f373d0bf93f39f13eb"    
    ],
  },
  walletConnectProjectId: "75f232fcfe4874121b3285c080d79993",
  sismoConnectDataSourcesConfig: [
    {
      appId: "0x3bcdab2ad3caddb11b90b02bde258f6b",
      type: "worldcoin",
      name: "World ID",
      request: {
        auths: [{
          authType: 0
        }],
        callbackUrl: "https://sismo-spaces-git-create-custom-app-sismo.vercel.app/worldcoin/proof-of-personhood"
      },
      groupId: "0x5ae52d5a2bb69b4e56f464d2248a9d96"
    }
  ]
};