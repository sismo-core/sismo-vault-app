import { VaultClient } from "./client";
import { ImportedAccount, Owner, RecoveryKey, Vault } from "./client.types";

const demoVault: Vault = {
  // TO FILL
};

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
    return "demo";
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
