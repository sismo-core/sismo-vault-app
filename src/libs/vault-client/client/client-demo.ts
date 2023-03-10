import { VaultClient } from "./client";
import { ImportedAccount, Owner, RecoveryKey, Vault } from "./client.types";
import { demoVault } from "./client-demo.mock";
import {
  commitmentMapperPubKeyDemo,
  commitmentReceiptDemo,
} from "../commitment-mapper/commitment-mapper.mock";

const demoRecoveryKey: RecoveryKey = {
  key: "demo",
  mnemonic: "demo",
  accountNumber: 0,
  valid: true,
  name: "demo",
  timestamp: 0,
};

export class VaultClientDemo extends VaultClient {
  public async createFromOwner(owner: Owner, name: string): Promise<Vault> {
    return demoVault;
  }

  public async createFromRecoveryKey(
    recoveryKey: RecoveryKey,
    name: string
  ): Promise<Vault> {
    return demoVault;
  }

  /*****************************************************************/
  /************************* VAULT SECRET & IDENTIFIER  ************/
  /*****************************************************************/

  public async getVaultSecret(owner: Owner): Promise<string> {
    return "0x000";
  }

  /*****************************************************************/
  /************************* RECOVERY KEYS ****************************/
  /*****************************************************************/

  public async getRecoveryKey(
    mnemonic?: string,
    accountNumber?: number
  ): Promise<RecoveryKey> {
    return demoRecoveryKey;
  }

  public async generateRecoveryKey(owner: Owner, name: string): Promise<Vault> {
    return demoVault;
  }

  public async deleteRecoveryKey(owner: Owner, key: string): Promise<Vault> {
    return demoVault;
  }

  public async generateMnemonic(owner: Owner): Promise<Vault> {
    return demoVault;
  }

  public async load(seed: string): Promise<Vault> {
    return demoVault;
  }

  public async importAccount(
    owner: Owner,
    account: ImportedAccount
  ): Promise<Vault> {
    return demoVault;
  }

  public async deleteImportedAccount(
    owner: Owner,
    accountDeleted: ImportedAccount
  ): Promise<Vault> {
    return demoVault;
  }

  /************************* OWNERS **********************/

  public async merge(ownerMain: Owner, ownerMerged: Owner): Promise<Vault> {
    return demoVault;
  }

  public async addOwner(owner: Owner, ownerAdded: Owner): Promise<Vault> {
    demoVault.owners.push(ownerAdded);

    const _importedAccount: ImportedAccount = {
      identifier: ownerAdded.identifier,
      seed: ownerAdded.seed,
      commitmentReceipt: commitmentReceiptDemo,
      commitmentMapperPubKey: commitmentMapperPubKeyDemo,
      type: "ethereum",
      timestamp: Date.now(),
    };

    demoVault.importedAccounts.push(_importedAccount);

    return demoVault;
  }

  public async deleteOwners(
    owner: Owner,
    ownersDeleted: Owner[]
  ): Promise<Vault> {
    return demoVault;
  }

  public async updateAutoImportOwners(
    owner: Owner,
    autoImportOwners: boolean
  ): Promise<Vault> {
    return demoVault;
  }

  public async updateKeepConnected(
    owner: Owner,
    keepConnected: boolean
  ): Promise<Vault> {
    return demoVault;
  }

  public async updateName(owner: Owner, name: string): Promise<Vault> {
    demoVault.settings.name = name;
    return demoVault;
  }

  public async delete(owner: Owner): Promise<void> {}
}
