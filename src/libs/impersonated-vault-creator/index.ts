import { sha256 } from "ethers/lib/utils";
import {
  CommitmentMapper,
  ImpersonatedCommitmentMapper,
} from "../commitment-mapper";
import { ImportedAccount, Owner, VaultClient, VaultV4 } from "../vault-client";
import { Web2Resolver } from "../web2-resolver";

type Configuration = {
  vaultClient: VaultClient;
  commitmentMapper: ImpersonatedCommitmentMapper;
  web2Resolver: Web2Resolver;
};

export class ImpersonatedVaultCreator {
  private _vaultClient: VaultClient;
  private _commitmentMapper: ImpersonatedCommitmentMapper;
  private _web2Resolver: Web2Resolver;

  constructor(configuration: Configuration) {
    this._vaultClient = configuration.vaultClient;
    this._commitmentMapper = configuration.commitmentMapper;
    this._web2Resolver = configuration.web2Resolver;
  }

  public async create({
    impersonatedAccounts,
  }: {
    impersonatedAccounts: string[];
  }) {
    const initialVault = this._vaultClient.create();
    const updatedVaultsArray: VaultV4[] = [];
    updatedVaultsArray.push(initialVault);
    const vaultSecret = await this._vaultClient.getVaultSecret();

    for (const account of impersonatedAccounts) {
      try {
        let vault: VaultV4;

        // if account is an ethereum address
        if (account.startsWith("0x")) {
          const seed = sha256(account);
          vault = await this._importAccountFromEthereum({
            account,
            seed,
            vaultSecret,
          });
          updatedVaultsArray.push(vault);
          continue;
        }

        // if account is a web2 identifier
        if (this._web2Resolver.getIdentifierType(account)) {
          const resolvedAccount = await this._web2Resolver.resolve(account);
          const seed = sha256(resolvedAccount.identifier);

          const accountNumber =
            updatedVaultsArray[
              updatedVaultsArray.length - 1
            ].importedAccounts.filter(
              (el) =>
                el.wallet && el.wallet.mnemonic === initialVault.mnemonics[0]
            )?.length || 0;

          vault = await this._importAccountFromWeb2({
            account: resolvedAccount,
            seed,
            vaultSecret,
            mnemonic: initialVault.mnemonics[0],
            accountNumber: accountNumber,
          });

          updatedVaultsArray.push(vault);
          continue;
        }
      } catch (e) {
        // if account is invalid skip it and continue
        console.log(e);
      }
    }

    const firstImportedAccount =
      updatedVaultsArray[updatedVaultsArray.length - 1].importedAccounts[0];

    const owner: Owner = firstImportedAccount && {
      identifier: firstImportedAccount.identifier,
      seed: firstImportedAccount.seed,
      timestamp: firstImportedAccount.timestamp,
    };

    const vault = owner && (await this._vaultClient.addOwner(owner));
    return {
      vault,
      owner,
    };
  }

  private async _importAccountFromWeb2({
    account,
    seed,
    vaultSecret,
    mnemonic,
    accountNumber,
  }: {
    account: Partial<ImportedAccount>;
    seed: string;
    vaultSecret: string;
    mnemonic: string;
    accountNumber: number;
  }): Promise<VaultV4> {
    const commitmentMapperSecret =
      CommitmentMapper.generateCommitmentMapperSecret(seed);

    const web2ImpersonatedCommitmentReceipt =
      await this._commitmentMapper.getWeb2ImpersonatedCommitmentReceipt(
        account,
        commitmentMapperSecret,
        vaultSecret
      );

    const importedAccount: ImportedAccount = {
      identifier: account.identifier,
      seed: seed,
      commitmentReceipt: web2ImpersonatedCommitmentReceipt.commitmentReceipt,
      commitmentMapperPubKey:
        web2ImpersonatedCommitmentReceipt.commitmentMapperPubKey,
      type: account.type,
      timestamp: Date.now(),
      profile: web2ImpersonatedCommitmentReceipt.profile,
      wallet: {
        mnemonic,
        accountNumber,
      },
    };

    return await this._vaultClient.importAccount(importedAccount);
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
