import { VaultClient } from "./client";
import { ImportedAccount, Owner, Vault } from "./client.types";
import { demoVault } from "./client-demo.mock";
import {
  commitmentMapperPubKeyDemo,
  commitmentReceiptDemo,
} from "../../commitment-mapper/mocks";

export class VaultClientDemo extends VaultClient {
  public create(): Vault {
    return demoVault;
  }

  /*****************************************************************/
  /************************* VAULT SECRET & IDENTIFIER  ************/
  /*****************************************************************/

  public async getVaultSecret(): Promise<string> {
    return "0x000";
  }

  /*****************************************************************/
  /************************* RECOVERY KEYS ****************************/
  /*****************************************************************/

  public async generateRecoveryKey(name: string): Promise<Vault> {
    return demoVault;
  }

  public async disableRecoveryKey(key: string): Promise<Vault> {
    return demoVault;
  }

  public async load(): Promise<Vault> {
    return demoVault;
  }

  public async importAccount(account: ImportedAccount): Promise<Vault> {
    return demoVault;
  }

  public async deleteImportedAccount(
    accountDeleted: ImportedAccount
  ): Promise<Vault> {
    return demoVault;
  }

  /************************* OWNERS **********************/

  public async addOwner(ownerAdded: Owner): Promise<Vault> {
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

  public async deleteOwners(ownersDeleted: Owner[]): Promise<Vault> {
    return demoVault;
  }

  public async setAutoImportOwners(autoImportOwners: boolean): Promise<Vault> {
    demoVault.settings.autoImportOwners = autoImportOwners;
    return demoVault;
  }

  public async setKeepConnected(keepConnected: boolean): Promise<Vault> {
    demoVault.settings.keepConnected = keepConnected;
    return demoVault;
  }

  public async updateName(name: string): Promise<Vault> {
    demoVault.settings.name = name;
    return demoVault;
  }

  public async delete(): Promise<void> {}

  public async unlock(seed: string): Promise<Vault> {
    return demoVault;
  }

  public lock(): void {}
}
