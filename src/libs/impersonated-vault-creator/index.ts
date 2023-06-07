import { sha256 } from "ethers/lib/utils";
import {
  CommitmentMapper,
  ImpersonatedCommitmentMapper,
} from "../commitment-mapper";
import { ImportedAccount, Owner, VaultClient, VaultV4 } from "../vault-client";
import { Web2IdentifierType, Web2Resolver } from "../web2-resolver";
import { isValidEthAddress } from "../../utils/regex";

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

  public async getImpersonationState({
    impersonatedAccounts,
  }: {
    impersonatedAccounts: string[];
  }): Promise<{
    isImpersonated: boolean;
    validAccounts: string[];
    impersonationErrors: string[];
  }> {
    const validAccounts = [];
    const impersonationErrors = [];

    for (const account of impersonatedAccounts) {
      if (account.startsWith("0x")) {
        isValidEthAddress(account)
          ? validAccounts.push(account)
          : impersonationErrors.push(
              `Invalid impersonated Ethereum address: ${account}`
            );
        continue;
      }

      const identifierType = this._web2Resolver.getIdentifierType(account);

      if (identifierType && identifierType !== Web2IdentifierType.GITHUB) {
        const parsedProfileHandle = account.split(":")[1];
        const parsedProfileId = account.split(":")[2];

        if (!parsedProfileId) {
          impersonationErrors.push(
            `Invalid impersonated identifier: ${account} - please use the following format ${this._web2Resolver.fromWeb2IdTypeToHumanReadable(
              identifierType
            )}:${parsedProfileHandle}:{id}`
          );
          continue;
        }

        try {
          await this._web2Resolver.resolve(account);
          validAccounts.push(account);
          continue;
        } catch (e) {
          impersonationErrors.push(
            `Invalid impersonated identifier: ${account} - ${e}`
          );
          continue;
        }
      }

      if (identifierType === Web2IdentifierType.GITHUB) {
        try {
          await this._web2Resolver.resolve(account);
          validAccounts.push(account);
          continue;
        } catch (e) {
          impersonationErrors.push(
            `Invalid impersonated identifier: ${account} - ${e}`
          );
          continue;
        }
      }
    }

    return {
      isImpersonated: impersonatedAccounts.length > 0,
      validAccounts,
      impersonationErrors,
    };
  }

  public async create({
    impersonatedAccounts,
  }: {
    impersonatedAccounts: string[];
  }) {
    const { validAccounts } = await this.getImpersonationState({
      impersonatedAccounts,
    });

    let vault = this._vaultClient.create();
    const vaultSecret = await this._vaultClient.getVaultSecret();

    for (const account of validAccounts) {
      try {
        // if account is an ethereum address
        if (account.startsWith("0x")) {
          const seed = sha256(account);
          vault = await this._importAccountFromEthereum({
            account,
            seed,
            vaultSecret,
          });
          continue;
        }

        // if account is a web2 identifier
        if (this._web2Resolver.getIdentifierType(account)) {
          const resolvedAccount = await this._web2Resolver.resolve(account);
          const seed = sha256(resolvedAccount.identifier);
          const accountNumber = this._getAccountNumber(vault);

          vault = await this._importAccountFromWeb2({
            account: resolvedAccount,
            seed,
            vaultSecret,
            mnemonic: vault.mnemonics[0],
            accountNumber: accountNumber,
          });
          continue;
        }
      } catch (e) {
        // if account is invalid skip it and continue
        console.log(e);
      }
    }

    const firstImportedAccount = vault.importedAccounts[0];
    const owner: Owner = firstImportedAccount
      ? {
          identifier: firstImportedAccount.identifier,
          seed: firstImportedAccount.seed,
          timestamp: firstImportedAccount.timestamp,
        }
      : { identifier: "", seed: "", timestamp: 0 };
    vault = await this._vaultClient.addOwner(owner);

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

  private _getAccountNumber(vault: VaultV4) {
    return (
      vault.importedAccounts.filter(
        (el: any) => el.wallet && el.wallet.mnemonic === vault.mnemonics[0]
      )?.length || 0
    );
  }
}
