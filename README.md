<br />
<div align="center">
  <img src="https://static.sismo.io/readme/top-main.png" alt="Logo" width="150" height="150" style="borderRadius: 20px">

  <h3 align="center">
    Sismo App
  </h3>

  <p align="center">
    Made by <a href="https://www.docs.sismo.io/" target="_blank">Sismo</a>
  </p>
  
  <p align="center">
    <a href="https://discord.gg/uAPtsfNrve" target="_blank">
        <img src="https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white"/>
    </a>
    <a href="https://twitter.com/sismo_eth" target="_blank">
        <img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white"/>
    </a>
  </p>
  <a href="https://www.sismo.io/" target="_blank"></a>
</div>

The Sismo app regroup 3 different apps:
- `Minting App` : Allows users to curate their identity (/)
- `Flows` : Allows badge creator to share their badges (/[flow name])
- `Prove with Sismo` : Allows dapps to get a proof of something from their users (/prove)

## Installation

```sh
$ yarn 
$ yarn start
```

## Deployments

| Env | Url  | deployment  | description  |
|---|---|---|---|
|  Prod |  https://app.sismo.io | push tag prod* | Production env |
|  Testnets | https://testnets.sismo.io  | push tag testnets*  | Production env with all testnets |
|  Staging public | https://staging.sismo.io  | push tag staging*  | Staging with same env than prod |
|  Staging intern | https://testnets.zikies.io  | push on main | Staging with internal env to test easily (badge eligible to all core team accounts, vault + commitment mapper editable etc) |

See [here](https://www.notion.so/sismo/Sismo-apps-production-process-56cc57fa784c4144b5081c6ec2a61c3f) the production process.

## Architecture

- `sismo-client` : all protocol logic (Attestation registry, Badges metadata, Eligibility / Minted badges, Attesters, contracts)
- `sismo` : export useSismo usable in all the app to access to the protocol logic
- `vault-client` : all vault logic (Imported accounts, commitment mapper, migration scripts)
- `vault` : export useVault usable in all the app to access to the vault logic
- `wallet` : export useWallet usable in all the app interact with web3 wallets (wrapper around https://onboard.blocknative.com/docs/overview/introduction#features)
- `web3-providers` : export getProvider(chainId) to access to web3 providers
- `main-scroll-manager` : manage the display of the scrollbar in all the app. This allow to remove the scrollbar when modals are open.
- `envs-monitoring` : verify that all the Sismo environment variables are correctly added

<br/>
<img src="https://static.sismo.io/readme/bottom-main.png" alt="bottom" width="100%" >
