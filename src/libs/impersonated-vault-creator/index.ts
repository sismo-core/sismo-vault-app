import { sha256 } from "ethers/lib/utils";
import {
  CommitmentMapper,
  ImpersonatedCommitmentMapper,
} from "../commitment-mapper";
import { ImportedAccount, Owner, VaultClient, VaultV4 } from "../vault-client";
import { AccountResolver } from "../account-resolver";
import { isValidEns, isValidEthAddress } from "../../utils/regex";

type Configuration = {
  vaultClient: VaultClient;
  commitmentMapper: ImpersonatedCommitmentMapper;
  accountResolver: AccountResolver;
  impersonatedAccounts: string[];
};

export class ImpersonatedVaultCreator {
  private _vaultClient: VaultClient;
  private _commitmentMapper: ImpersonatedCommitmentMapper;
  private _accountResolver: AccountResolver;
  private _impersonatedAccounts: string[];

  constructor(configuration: Configuration) {
    this._vaultClient = configuration.vaultClient;
    this._commitmentMapper = configuration.commitmentMapper;
    this._accountResolver = configuration.accountResolver;
    this._impersonatedAccounts = configuration.impersonatedAccounts;
  }

  public async getImpersonationState(): Promise<{
    isImpersonated: boolean;
    validAccounts: string[];
    impersonationErrors: string[];
  }> {
    if (this._impersonatedAccounts.length === 0) {
      return {
        isImpersonated: false,
        validAccounts: [],
        impersonationErrors: [],
      };
    }

    const validAccounts = [];
    const impersonationErrors = [];

    for (const account of this._impersonatedAccounts) {
      try {
        if (isValidEthAddress(account)) {
          isValidEthAddress(account)
            ? validAccounts.push(account?.toLowerCase())
            : impersonationErrors.push(
                `Invalid impersonated Ethereum address: ${account}`
              );
          continue;
        }

        const identifierType = this._accountResolver.getIdentifierType(account);
        if (identifierType) {
          try {
            await this._accountResolver.resolve(account);
            validAccounts.push(account);
            continue;
          } catch (e) {
            impersonationErrors.push(
              `Invalid impersonated identifier: ${account} - account does not exist or is not public. ${e}`
            );
            continue;
          }
        }
      } catch (e) {
        impersonationErrors.push(
          `Invalid impersonated identifier: ${account} - please use the following format: ENS, 0x{ethereumAddress} or {web2}:{handle}`
        );
      }
    }

    return {
      isImpersonated: this._impersonatedAccounts.length > 0,
      validAccounts,
      impersonationErrors,
    };
  }

  public async create() {
    const { validAccounts } = await this.getImpersonationState();

    let vault = this._vaultClient.create();
    const vaultSecret = await this._vaultClient.getVaultSecret();

    for (const account of validAccounts) {
      try {
        // if account is an ethereum address
        if (isValidEthAddress(account)) {
          const seed = sha256(account);
          vault = await this._importAccountFromEthereum({
            account,
            seed,
            vaultSecret,
          });
          continue;
        }

        if (isValidEns(account)) {
          const ethAccount = await this._accountResolver.resolve(account);
          const seed = sha256(ethAccount.identifier);
          vault = await this._importAccountFromEthereum({
            account: ethAccount.identifier,
            seed,
            vaultSecret,
            ens: account,
          });
          continue;
        }

        // if account is a web2 identifier
        if (this._accountResolver.getIdentifierType(account)) {
          const resolvedAccount = await this._accountResolver.resolve(account);
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
    ens,
  }: {
    account: string;
    seed: string;
    vaultSecret: string;
    ens?: string;
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

    if (ens) {
      importedAccount.ens = { name: ens };
    }

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
