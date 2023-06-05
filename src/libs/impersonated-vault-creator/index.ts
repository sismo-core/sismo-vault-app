import { sha256 } from "ethers/lib/utils";
import {
  CommitmentMapper,
  ImpersonatedCommitmentMapper,
} from "../commitment-mapper";
import { ImportedAccount, Owner, VaultClient, VaultV4 } from "../vault-client";

type Configuration = {
  vaultClient: VaultClient;
  commitmentMapper: ImpersonatedCommitmentMapper;
};

export class ImpersonatedVaultCreator {
  private _vaultClient: VaultClient;
  private _commitmentMapper: ImpersonatedCommitmentMapper;

  constructor(configuration: Configuration) {
    this._vaultClient = configuration.vaultClient;
    this._commitmentMapper = configuration.commitmentMapper;
  }

  public async create({
    impersonatedAccounts,
  }: {
    impersonatedAccounts: string[];
  }) {
    this._vaultClient.create();
    const vaultSecret = await this._vaultClient.getVaultSecret();

    // dynamic
    const updatedVaultsArray = [];

    for (const account of impersonatedAccounts) {
      let vault: VaultV4;
      const seed = sha256(account);
      if (account.startsWith("0x")) {
        vault = await this._importAccountFromEthereum({
          account,
          seed,
          vaultSecret,
        });
      }

      if (account.startsWith("github:")) {
        // TODO: implement
      }

      if (account.startsWith("twitter:")) {
        // TODO: implement
      }
      updatedVaultsArray.push(vault);
    }

    // const updatedVaultsArray = await Promise.all(
    //   impersonatedAccounts.map(async (account) => {
    //     if (account.startsWith("0x")) {
    //       return await this._importAccountFromEthereum({
    //         account,
    //         accountSecret,
    //         vaultSecret,
    //       });
    //     }

    //     if (account.startsWith("github:")) {
    //       // TODO: implement
    //     }

    //     if (account.startsWith("twitter:")) {
    //       // TODO: implement
    //     }
    //   })
    // );

    const firstImportedAccount =
      updatedVaultsArray[impersonatedAccounts.length - 1].importedAccounts[0];

    const owner: Owner = {
      identifier: firstImportedAccount.identifier,
      seed: firstImportedAccount.seed,
      timestamp: firstImportedAccount.timestamp,
    };

    const vault = await this._vaultClient.addOwner(owner);
    return {
      vault,
      owner,
    };
  }

  private async _importAccountFromEthereum({
    account,
    seed,
    vaultSecret,
  }: {
    account: string;
    seed: string;
    vaultSecret: string;
  }): Promise<VaultV4> {
    const commitmentMapperSecret =
      CommitmentMapper.generateCommitmentMapperSecret(seed);

    const { commitmentMapperPubKey, commitmentReceipt } =
      await this._commitmentMapper.getEthereumCommitmentReceipt(
        account,
        "eth-signature-not-used",
        commitmentMapperSecret,
        vaultSecret
      );

    const importedAccount: ImportedAccount = {
      identifier: account,
      seed: seed,
      commitmentReceipt,
      commitmentMapperPubKey,
      type: "ethereum",
      timestamp: Date.now(),
    };

    return await this._vaultClient.importAccount(importedAccount);
  }
}
