//app.sismo.io
window.env = {
  name: "PROD",
  chainIds: [137, 100, 1],
  disabledMinting: false,
  disabledNullifier: false,
  disabledSentry: false,
  vaultURL: "https://vault-api.sismo.io",
  factoryApiUrl: "https://factory-api.sismo.io",
  relayerEndpoints: {
    1: [
      "https://api.defender.openzeppelin.com/autotasks/1bc7947c-0b0c-49fc-8912-14fb90bff8b9/runs/webhook/b4340068-6b9e-453b-809e-5f861121c806/NdVQevMDGg5kDSpVuUvtBW",
    ],
    137: [
      "https://api.defender.openzeppelin.com/autotasks/aed971e3-2a72-476a-8832-be8d09984ad0/runs/webhook/b4340068-6b9e-453b-809e-5f861121c806/8XbYFphAL3UAiygFt4SXhF",
      "https://api.defender.openzeppelin.com/autotasks/49263d80-9029-41b2-9d9c-276eb9828ae0/runs/webhook/b4340068-6b9e-453b-809e-5f861121c806/4MVGwd96oVp4f9oQxfUHAD",
      "https://api.defender.openzeppelin.com/autotasks/a2289f47-64ea-4ee6-ae5b-2ea0db9765b9/runs/webhook/b4340068-6b9e-453b-809e-5f861121c806/RrQh65ewTKgjDbQevjXkZN",
      "https://api.defender.openzeppelin.com/autotasks/841f1b4e-4832-4ab8-95ea-4e33a6b2864b/runs/webhook/b4340068-6b9e-453b-809e-5f861121c806/HEAU8KF99SGa1skoPArvQp",
      "https://api.defender.openzeppelin.com/autotasks/996fe8a3-8afa-49cb-9650-4de12d59826f/runs/webhook/b4340068-6b9e-453b-809e-5f861121c806/FjZAE676eRxBM7MwG92Lnt",
    ],
    100: [
      "https://api.defender.openzeppelin.com/autotasks/632c7ce7-8e2b-4fb5-8697-05ffdec3a113/runs/webhook/b4340068-6b9e-453b-809e-5f861121c806/XfSJNEvdRKdjf57LEMncDi",
    ],
  },
  commitmentMapperUrl: "https://sibgc1bwn8.execute-api.eu-west-1.amazonaws.com",
  badgesApiUrl: "https://hub.sismo.io",
  hydraApiUrl: "https://hub.sismo.io",
  flowsApiUrl: "https://hub.sismo.io",
  synapsApiUrl: "https://gwf3m9xzuj.execute-api.eu-west-3.amazonaws.com",
  githubOauthClientId: "ed165a166320d0676ccb",
  sismoSubGraphAPIUrls: {
    1: "https://subgraphs-sismo-mainnet.sismo.io/subgraphs/name/sismo-core/sismo-mainnet",
    137: "https://subgraphs-sismo-polygon.sismo.io/subgraphs/name/sismo-core/sismo-polygon",
    100: "https://subgraphs-sismo-gnosis.sismo.io/subgraphs/name/sismo-core/sismo-gnosis",
  },
  s3SubgraphAPIUrls: {
    1: "https://subgraphs-sismo-cache-data.s3.eu-west-1.amazonaws.com/sismo-mainnet",
    137: "https://subgraphs-sismo-cache-data.s3.eu-west-1.amazonaws.com/sismo-polygon",
    100: "https://subgraphs-sismo-cache-data.s3.eu-west-1.amazonaws.com/sismo-gnosis",
  },
  contracts: {
    1: {
      "AttestationsRegistry": {
        address: "0xB62F00e4e637e0E1031420D86B84e46BaE2a139F",
      },
      "Badges": {
        address: "0xe77eb6fb5037bCb11db10b9Ae478A7D01354Ae01",
      },
      "HydraS1AccountboundAttester": {
        address: "0x0Fb92857855A34F6bFf6f8c42F9673f6e8329406",
      },
      "Pythia1SimpleAttester": {
        address: "0xdd12CD5EeA2F185E675120044d4A1b9dB99933c2",
      },
      "Front": {
        address: "0xF518eBd3feeb8dc240b5dE46Ec6C57A0313891c1",
      },
      "FrontendLib": {
        address: null,
      },
    },
    137: {
      "AttestationsRegistry": {
        address: "0xa37c32adE310f83B5A9E31b82f72011D5BFb5EFA",
        deploymentTxnHash:
          "0xd54ff70dd96f02a6b67ad7a13a930e7e876fdc4f5def3c820dad084fa0254da1",
      },
      "Badges": {
        address: "0xF12494e3545D49616D9dFb78E5907E9078618a34",
      },
      "HydraS1AccountboundAttester": {
        address: "0x10b27d9efa4A1B65412188b6f4F29e64Cf5e0146",
      },
      "Pythia1SimpleAttester": {
        address: "0xb9842C44af7692C02304EAC00D0d7F4d10147246",
      },
      "Front": {
        address: "0x2777b09dd2Cb4E6d62c1823AD074B43DfcC945Fd",
      },
      "FrontendLib": {
        address: "0x80D92C9cEEb4743D606259793f4553CBA2b5046F",
      },
    },
    100: {
      "AttestationsRegistry": {
        address: "0xd0c551dA71B2c3DA65f0bA0500FA4251d26179A8",
        deploymentTxnHash:
          "0xbe760cf0655f2dccbe5b6349bccc8d2c362777acbaf14d9827303e13b4a77ed5",
      },
      "Badges": {
        address: "0xa67f1C6c96CB5dD6eF24B07A77893693C210d846",
      },
      "HydraS1AccountboundAttester": {
        address: "0x0a764805Ad76A740D46C81C9A8978790C227084C",
      },
      "Pythia1SimpleAttester": {
        address: "0x919DBe676138ec75Ba03b65F6106EcDEdcE011bD",
      },
      "Front": {
        address: "0xC21393D2c8E214ccDC37af4220a675fb3B59491A",
      },
      "FrontendLib": {
        address: "0xf403c9733175Ffa3161dE330EECf2d0DBFaCDB57",
      },
    },
  },
  rpc: {
    1: {
      overrideUrl: null,
      logsLimit: 2000,
    },
    137: {
      overrideUrl: null,
      logsLimit: 2000,
    },
    100: {
      overrideUrl: null,
      logsLimit: 2000,
    },
  },
  sismoDestination: {
    address: "0x0000000000000000000000000000000000515110",
    sec: 515110,
    commitmentMapperPubKey: [
      "0x0c6c16efc72c198f4549bd069f1e57f091885234b9c140286d80ef431151d644",
      "0x12c54731563d974ead25d469d2263fdf0e230d5a09f6cd40a06e60210610d642",
    ],
    commitmentReceipt: [
      "0x0efc00005caca3317d85bcd00b52320f9206ab7b91eccd8bcbdf7a0b4a170073",
      "0x1627540d131244ef425588a0874c7e723af4ad0203700984c89cb79575ad6847",
      "0x01ed0e48f1d9ae09b9165f281e572e0c8df00b0599fa37fb34f42a4cdc169e95",
    ],
  },
};
