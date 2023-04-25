import { Owner } from ".";
import { Seed } from "../../sismo-client";
import migration from "../migration/migration";
import { ImportedAccount } from "..";
import { VaultProvider } from "../provider/provider";
import { BaseStore } from "../stores/base-store";
import { SismoWallet, WalletPurpose } from "../wallet";
import { RecoveryKey, Vault } from "./client.types";
import SHA3 from "sha3";
import { BigNumber } from "ethers";
import { SNARK_FIELD } from "@sismo-core/hydra-s2";

export class VaultClient {
  private _provider: VaultProvider;
  private _seed: string;
  private _unSavedVault: Vault;

  constructor(store: BaseStore) {
    this._provider = new VaultProvider({ store });
  }

  /*****************************************************************/
  /***************************** CREATE ****************************/
  /*****************************************************************/

  public create(): Vault {
    if (this._seed)
      throw new Error(
        "Unlocked vault, please lock it before creating a new vault"
      );
    const mnemonic = SismoWallet.generateMnemonic();
    const createdVault: Vault = {
      mnemonics: [mnemonic],
      importedAccounts: [],
      recoveryKeys: [],
      owners: [],
      settings: {
        autoImportOwners: true,
        name: "My Sismo Vault",
        keepConnected: true,
      },
      timestamp: Date.now(),
      version: 4,
    };
    this._unSavedVault = createdVault;
    return createdVault;
  }

  /*****************************************************************/
  /************************* LOCK & UNLOCK  ************************/
  /*****************************************************************/

  public async unlock(seed: string): Promise<Vault> {
    const vault = await this._get(seed);
    if (!vault) return null;
    this._seed = seed;
    return vault;
  }

  public isUnlocked(): boolean {
    return Boolean(this._seed) || Boolean(this._unSavedVault);
  }

  public lock(): void {
    this._unSavedVault = null;
    this._seed = null;
  }

  public async load(): Promise<Vault> {
    return await this._getCurrentVault();
  }

  /*****************************************************************/
  /************************* VAULT SECRET & IDENTIFIER  ************/
  /*****************************************************************/

  public async getVaultSecret(): Promise<string> {
    const currentVault = await this._getCurrentVault();
    const mnemonic = currentVault.mnemonics[0];
    const hash = new SHA3(256);
    const vaultSecret = BigNumber.from(
      "0x" + hash.update(mnemonic + "/vaultSecret").digest("hex")
    )
      .mod(SNARK_FIELD)
      .toHexString();
    return vaultSecret;
  }

  /*****************************************************************/
  /*********************** RECOVERY KEYS ***************************/
  /*****************************************************************/

  public async generateRecoveryKey(name: string): Promise<Vault> {
    const currentVault = await this._getCurrentVault();

    if (!currentVault.mnemonics || currentVault.mnemonics.length === 0) {
      throw new Error("No phrase generated");
    }

    let accountNumber = 0;
    if (currentVault.recoveryKeys) {
      const recoveryKeys = currentVault.recoveryKeys.filter(
        (backup) => backup.mnemonic === currentVault.mnemonics[0]
      );
      accountNumber = recoveryKeys.length;
    }

    const recoveryKey = await this._buildRecoveryKey(
      currentVault.mnemonics[0],
      accountNumber,
      name
    );

    const updatedVault: Vault = {
      ...currentVault,
      recoveryKeys: [...currentVault.recoveryKeys, recoveryKey],
    };

    await this._post(updatedVault);
    return updatedVault;
  }

  private async _buildRecoveryKey(
    mnemonic: string,
    accountNumber: number,
    name?: string
  ): Promise<RecoveryKey> {
    const num = Math.floor(Math.random() * 1000000000);
    const _name = name ?? `RecoveryKey #${num}`;
    const sismoWallet = new SismoWallet(mnemonic);
    const message = Seed.getSeedMsg(
      sismoWallet.getAccount(WalletPurpose.RECOVERY_KEY, accountNumber)
    );
    const seedSignature = await sismoWallet.sign(
      WalletPurpose.RECOVERY_KEY,
      accountNumber,
      message
    );
    const seed = Seed.generateSeed(seedSignature);
    const recoveryKey: RecoveryKey = {
      name: _name,
      key: seed,
      mnemonic: mnemonic,
      accountNumber,
      valid: true,
      timestamp: Date.now(),
    };
    return recoveryKey;
  }

  public async addRecoveryKey(recoveryKeyAdded: RecoveryKey): Promise<Vault> {
    const currentVault = await this._getCurrentVault();

    if (
      currentVault.recoveryKeys.find(
        (recoveryKey) => recoveryKey.key === recoveryKeyAdded.key
      )
    ) {
      throw new Error("RecoveryKey already imported");
    }

    const addedRecoveryKeyVault = await this._get(recoveryKeyAdded.key);
    if (addedRecoveryKeyVault) {
      throw new Error("RecoveryKey already used in another Vault");
    }

    const updatedVault = {
      ...currentVault,
      recoveryKeys: [...currentVault.recoveryKeys, recoveryKeyAdded],
    };
    await this._post(updatedVault);
    return updatedVault;
  }

  public async disableRecoveryKey(key: string): Promise<Vault> {
    const currentVault = await this._getCurrentVault();

    const recoveryKeys = [...currentVault.recoveryKeys];

    const index = recoveryKeys.findIndex((backup) => backup.key === key);

    if (index === -1) throw new Error("Key not found in the recovery keys");

    this._provider.post(key, "deleted", currentVault.version);

    recoveryKeys[index].valid = false;

    const updatedVault: Vault = {
      ...currentVault,
      recoveryKeys: recoveryKeys,
    };

    await this._post(updatedVault);
    return updatedVault;
  }

  /*****************************************************************/
  /************************* GET NEXT SEED *************************/
  /*****************************************************************/

  // This function allow to get the next seed for a defined purpose
  // This is used for web2 account that need a secret before calling
  // the commitment mapper

  public async getNextSeed(
    purpose: WalletPurpose
  ): Promise<{ seed: string; mnemonic: string; accountNumber: number }> {
    const currentVault = await this._getCurrentVault();
    let mnemonic = currentVault.mnemonics[0];
    if (purpose === WalletPurpose.IMPORTED_ACCOUNT) {
      const accountNumber = currentVault.importedAccounts.filter(
        (account) => account.wallet && account.wallet.mnemonic === mnemonic
      ).length;
      const wallet = new SismoWallet(mnemonic);
      const account = wallet.getAccount(purpose, accountNumber);
      const message = Seed.getSeedMsg(account);
      const signature = await wallet.sign(purpose, accountNumber, message);
      return {
        seed: Seed.generateSeed(signature),
        accountNumber: accountNumber,
        mnemonic: mnemonic,
      };
    }
  }

  /*****************************************************************/
  /*********************** IMPORT ACCOUNT **************************/
  /*****************************************************************/

  public async importAccount(account: ImportedAccount): Promise<Vault> {
    const currentVault = await this._getCurrentVault();

    if (account.type !== "ethereum") {
      if (!account.wallet)
        throw new Error("Web 2 accounts must be imported with a wallet");
      if (!account.profile)
        throw new Error("Web 2 accounts must be imported with a profile");

      if (currentVault.mnemonics[0] !== account.wallet.mnemonic)
        throw new Error("Can't import web2 account with invalid phrase");

      const accountWithSameMnemonics = currentVault.importedAccounts.filter(
        (el) => el.wallet && el.wallet.mnemonic === account.wallet.mnemonic
      );
      if (account.wallet.accountNumber !== accountWithSameMnemonics.length)
        throw new Error("Can't import web2 account with invalid accountNumber");
    }

    if (
      currentVault.importedAccounts.find(
        (el) => el.identifier === account.identifier
      )
    ) {
      throw new Error("Account already imported");
    }

    const updatedVault: Vault = {
      ...currentVault,
      importedAccounts: [...currentVault.importedAccounts, account],
    };

    await this._post(updatedVault);
    return updatedVault;
  }

  public async deleteImportedAccount(
    accountDeleted: ImportedAccount
  ): Promise<Vault> {
    const currentVault = await this._getCurrentVault();

    const accounts = currentVault.importedAccounts.filter((account) => {
      return accountDeleted.identifier !== account.identifier;
    });

    if (accounts.length === currentVault.importedAccounts.length) {
      throw new Error(`Account not found in this vault`);
    }

    const updatedVault: Vault = {
      ...currentVault,
      importedAccounts: accounts,
    };

    await this._post(updatedVault);
    return updatedVault;
  }

  /*****************************************************************/
  /****************************** OWNER ****************************/
  /*****************************************************************/

  public async addOwner(ownerAdded: Owner): Promise<Vault> {
    const currentVault = await this._getCurrentVault();

    if (
      currentVault.owners.find(
        (owner) => owner.identifier === ownerAdded.identifier
      )
    ) {
      throw new Error("Owner already imported");
    }

    const addedOwnerVault = await this._get(ownerAdded.seed);
    if (addedOwnerVault) {
      return await this.merge(ownerAdded);
    }

    const updatedVault = {
      ...currentVault,
      owners: [...currentVault.owners, ownerAdded],
    };
    await this._post(updatedVault);
    return updatedVault;
  }

  public async deleteOwners(ownersDeleted: Owner[]): Promise<Vault> {
    const currentVault = await this._getCurrentVault();

    const owners = currentVault.owners.filter((owner) => {
      return !ownersDeleted.find(
        (ownerDeleted) => ownerDeleted.identifier === owner.identifier
      );
    });

    if (owners.length === currentVault.owners.length) {
      throw new Error(`Owners not found in this vault`);
    }

    if (owners.length === 0) {
      throw new Error(`Can't delete last owner of this vault`);
    }

    await Promise.all(
      ownersDeleted.map((ownerDeleted) =>
        this._provider.post(ownerDeleted.seed, "deleted", currentVault.version)
      )
    );

    const updatedVault = {
      ...currentVault,
      owners: owners,
    };
    await this._post(updatedVault);
    return updatedVault;
  }

  /*****************************************************************/
  /*************************** SETTINGS ****************************/
  /*****************************************************************/

  public async setAutoImportOwners(autoImportOwners: boolean): Promise<Vault> {
    const currentVault = await this._getCurrentVault();
    const updatedVault = {
      ...currentVault,
      settings: {
        ...currentVault.settings,
        autoImportOwners: autoImportOwners,
      },
    };
    await this._post(updatedVault);
    return updatedVault;
  }

  public async setKeepConnected(keepConnected: boolean): Promise<Vault> {
    const currentVault = await this._getCurrentVault();
    const updatedVault = {
      ...currentVault,
      settings: {
        ...currentVault.settings,
        keepConnected: keepConnected,
      },
    };
    await this._post(updatedVault);
    return updatedVault;
  }

  public async updateName(name: string): Promise<Vault> {
    const currentVault = await this._getCurrentVault();

    const updatedVault = {
      ...currentVault,
      settings: {
        ...currentVault.settings,
        name: name,
      },
    };

    await this._post(updatedVault);
    return updatedVault;
  }

  /*****************************************************************/
  /***************************** MERGE *****************************/
  /*****************************************************************/

  public async merge(ownerMerged: Owner): Promise<Vault> {
    const vault1 = await this._get(this._seed);
    if (!vault1) throw new Error("No vault found on first owner");
    const vault2 = await this._get(ownerMerged.seed);
    if (!vault2) throw new Error("No vault found on second owner");

    const owners: Owner[] = [...vault1.owners];
    for (let owner of vault2.owners) {
      if (!owners.find((el) => el.identifier === owner.identifier)) {
        owners.push(owner);
      }
    }

    const importedAccounts: ImportedAccount[] = [...vault1.importedAccounts];
    for (let account of vault2.importedAccounts) {
      if (
        !importedAccounts.find((el) => el.identifier === account.identifier)
      ) {
        importedAccounts.push(account);
      }
    }

    const mnemonics: string[] = [...vault1.mnemonics, ...vault2.mnemonics];

    const recoveryKeys = [...vault1.recoveryKeys, ...vault2.recoveryKeys];

    const updatedVault: Vault = {
      mnemonics: mnemonics,
      owners: owners,
      recoveryKeys: recoveryKeys,
      importedAccounts: importedAccounts,
      settings: {
        name: vault1.settings.name,
        autoImportOwners: vault1.settings.autoImportOwners,
        keepConnected: vault1.settings.keepConnected,
      },
      timestamp: vault1.timestamp,
      version: 4,
    };

    await this._post(updatedVault, JSON.stringify(updatedVault));
    return updatedVault;
  }

  /*****************************************************************/
  /***************************** DELETE ****************************/
  /*****************************************************************/

  public async delete(): Promise<void> {
    const currentVault = await this._getCurrentVault();
    if (currentVault.mnemonics && currentVault.mnemonics.length > 0) {
      throw new Error("Can't delete this vault");
    }
    await this._post(currentVault, "deleted");
  }

  /*****************************************************************/
  /***************************** UTILS *****************************/
  /*****************************************************************/

  private async _getCurrentVault(): Promise<Vault> {
    if (this._unSavedVault) return this._unSavedVault;
    if (!this._seed) throw new Error("No vault unlocked");
    const currentVault = await this._get(this._seed);
    if (!currentVault) {
      this._seed = null;
      throw new Error("No vault available on the unlocked seed");
    }
    return currentVault;
  }

  private async _post(vault: Vault, forceText?: string): Promise<void> {
    if (vault.owners.length === 0 && vault.recoveryKeys.length === 0) {
      this._unSavedVault = vault;
      return;
    }
    // forceText allow to save a text instead of the vault
    // used to delete the vault by replacing the vault by "deleted"
    const text = forceText ?? JSON.stringify(vault);

    await Promise.all([
      ...vault.owners.map((owner) =>
        this._provider.post(owner.seed, text, vault.version)
      ),
      ...vault.recoveryKeys
        .filter((backup) => backup.valid)
        .map((backup) => this._provider.post(backup.key, text, vault.version)),
    ]);

    if (this._unSavedVault) {
      if (vault.owners.length > 0) this._seed = vault.owners[0].seed;
      if (vault.recoveryKeys.length > 0) this._seed = vault.recoveryKeys[0].key;
      this._unSavedVault = null;
    }
  }

  private async _get(seed: string): Promise<Vault> {
    if (seed === null) return this._unSavedVault;

    const vaultString = await this._provider.get(seed);
    if (vaultString === "deleted") return null;
    let vault = JSON.parse(vaultString);
    return migration(vault);
  }
}
