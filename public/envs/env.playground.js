//playground.sismo.io
window.env = {
    name: "PLAYGROUND",
    chainIds: [137],
    disabledMinting: false,
    disabledNullifier: false,
    disabledSentry: false,
    vaultURL: "https://vault-api.sismo.io",
    relayerEndpoints: {
        137: [
            "https://api.defender.openzeppelin.com/autotasks/0e2af74c-3f3b-43d2-bf2c-89d813781045/runs/webhook/b4340068-6b9e-453b-809e-5f861121c806/DA7jMgvqjH5NsaTs29hZHA"
        ]
    },
    commitmentMapperUrl: "https://sibgc1bwn8.execute-api.eu-west-1.amazonaws.com",
    badgesApiUrl: "https://hub.playground.sismo.io",
    hydraApiUrl: "https://hub.playground.sismo.io",
    flowsApiUrl: "https://hub.playground.sismo.io",
    synapsApiUrl: "https://gwf3m9xzuj.execute-api.eu-west-3.amazonaws.com",
    githubOauthClientId: "ed165a166320d0676ccb",
    sismoSubGraphAPIUrls: {
        137: "https://api.thegraph.com/subgraphs/name/yum0e/playground-sismo-subgraph"
    },
    s3SubgraphAPIUrls: {
        137: null
    },
    contracts: {
        137: {
            "AttestationsRegistry": {
                address: "0xC999390A856e0633f945dD851DeeCE15b533ccA3",
                deploymentTxnHash: "0x4e707a0f3e31f6c1da80877fa83dc03d20207abd3e93bbc3175f9a074dd6b32f"
            },
            "Badges": {
                address: "0x71a7089C56DFf528f330Bc0116C0917cd05B51Fc",
            },
            "HydraS1AccountboundAttester": {
                address: "0x0AB188c7260666146B300aD3ad5b2AB99eb91D45",
            },
            "Pythia1SimpleAttester": {
                address: "0x5ee338769C0205c19c0Bf21C35A42b1645B89998",
            },
            "Front": {
                address: "0xfC6f6b50B9Ee651B73B481E2cd221aFffc26a5E4",
            },
            "FrontendLib": {
                address: "0x692B275E6f40E72eEacDE156daB73240B82Dd91f"
            }
        }
    },
    rpc: {
        137: {
            overrideUrl: null,
            logsLimit: 2000
        },
    }
}