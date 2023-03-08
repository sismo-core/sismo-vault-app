import { Owner } from ".";
import { Seed } from "../../sismo-client";
import migration from "../migration/migration";
import { ImportedAccount } from "..";
import { VaultProvider } from "../provider/provider";
import { BaseStore } from "../stores/base-store";
import { SismoWallet, WalletPurpose } from "../wallet";
import { RecoveryKey, Vault } from "./client.types";
import { buildPoseidon } from "@sismo-core/crypto";
import SHA3 from "sha3";
import { BigNumber } from "ethers";
import { SNARK_FIELD } from "@sismo-core/hydra-s1";

export class VaultClient {
  private provider: VaultProvider;

  constructor(store: BaseStore) {
    this.provider = new VaultProvider({ store });
  }
  /*****************************************************************/
  /***************************** CREATE ****************************/
  /*****************************************************************/

  public async createFromOwner(owner: Owner, name: string): Promise<Vault> {
    const currentVault = await this.get(owner.seed);
    if (currentVault) throw new Error("Vault already exist");
    const mnemonic = SismoWallet.generateMnemonic();
    const createdVault: Vault = {
      mnemonics: [mnemonic],
      importedAccounts: [],
      recoveryKeys: [],
      owners: [owner],
      settings: {
        autoImportOwners: true,
        name: name,
        keepConnected: true,
      },
      timestamp: Date.now(),
      version: 4,
    };
    await this.post(createdVault, JSON.stringify(createdVault));
    return createdVault;
  }

  public async createFromRecoveryKey(
    recoveryKey: RecoveryKey,
    name: string
  ): Promise<Vault> {
    const createdVault: Vault = {
      mnemonics: [recoveryKey.mnemonic],
      importedAccounts: [],
      recoveryKeys: [recoveryKey],
      owners: [],
      settings: {
        autoImportOwners: true,
        name: name,
        keepConnected: true,
      },
      timestamp: Date.now(),
      version: 4,
    };
    await this.post(createdVault, JSON.stringify(createdVault));
    return createdVault;
  }

  /*****************************************************************/
  /************************* VAULT SECRET & IDENTIFIER  ************/
  /*****************************************************************/

  public async getVaultSecret(owner: Owner): Promise<string> {
    const currentVault = await this.get(owner.seed);
    if (!currentVault) throw new Error("No vault found on this owner");

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
  /************************* RECOVERY KEYS ****************************/
  /*****************************************************************/

  public async getRecoveryKey(
    mnemonic?: string,
    accountNumber?: number
  ): Promise<RecoveryKey> {
    mnemonic = mnemonic ? mnemonic : SismoWallet.generateMnemonic();
    accountNumber = accountNumber ? accountNumber : 0;
    const num = Math.floor(Math.random() * 1000000000);
    const _name = `RecoveryKey #${num}`;
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

  public async generateRecoveryKey(owner: Owner, name: string): Promise<Vault> {
    const currentVault = await this.get(owner.seed);
    if (!currentVault) throw new Error("No vault found on this owner");

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

    const recoveryKey = await this.getRecoveryKey(
      currentVault.mnemonics[0],
      accountNumber
    );

    const updatedVault: Vault = {
      ...currentVault,
      recoveryKeys: [...currentVault.recoveryKeys, recoveryKey],
    };

    await this.post(updatedVault, JSON.stringify(updatedVault));
    return updatedVault;
  }

  public async deleteRecoveryKey(owner: Owner, key: string): Promise<Vault> {
    const currentVault = await this.get(owner.seed);
    if (!currentVault) throw new Error("No vault found on this owner");

    const recoveryKeys = [...currentVault.recoveryKeys];

    const index = recoveryKeys.findIndex((backup) => backup.key === key);

    if (index === -1) throw new Error("Key not found in the recovery keys");

    this.provider.post(key, "deleted", currentVault.version);

    recoveryKeys[index].valid = false;

    const updatedVault: Vault = {
      ...currentVault,
      recoveryKeys: recoveryKeys,
    };

    await this.post(updatedVault, JSON.stringify(updatedVault));
    return updatedVault;
  }

  /*****************************************************************/
  /*************************** MNEMONIC ****************************/
  /*****************************************************************/

  public async generateMnemonic(owner: Owner): Promise<Vault> {
    const currentVault = await this.get(owner.seed);
    if (!currentVault) throw new Error("No vault found on this owner");

    if (currentVault.mnemonics && currentVault.mnemonics.length > 0) {
      throw new Error("Phrase already generated");
    }

    const mnemonic = SismoWallet.generateMnemonic();

    const updatedVault: Vault = {
      ...currentVault,
      mnemonics: [mnemonic],
    };

    await this.post(updatedVault, JSON.stringify(updatedVault));
    return updatedVault;
  }

  /*****************************************************************/
  /****************************** READ *****************************/
  /*****************************************************************/

  public async load(seed: string): Promise<Vault> {
    const vault = await this.get(seed);
    if (!vault) return null;
    return vault;
  }

  /*****************************************************************/
  /***************************** UPDATE ****************************/
  /*****************************************************************/

  /************************* IMPORT ACCOUNT **********************/

  public async importAccount(
    owner: Owner,
    account: ImportedAccount
  ): Promise<Vault> {
    const currentVault = await this.get(owner.seed);
    if (!currentVault) throw new Error("No vault found on this owner");

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

    await this.post(updatedVault, JSON.stringify(updatedVault));
    return updatedVault;
  }

  public async deleteImportedAccount(
    owner: Owner,
    accountDeleted: ImportedAccount
  ): Promise<Vault> {
    const currentVault = await this.get(owner.seed);
    if (!currentVault) throw new Error("No vault found on this owner");

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

    await this.post(updatedVault, JSON.stringify(updatedVault));
    return updatedVault;
  }

  /************************* OWNERS **********************/

  public async merge(ownerMain: Owner, ownerMerged: Owner): Promise<Vault> {
    const vault1 = await this.get(ownerMain.seed);
    if (!vault1) throw new Error("No vault found on first owner");
    const vault2 = await this.get(ownerMerged.seed);
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

    await this.post(updatedVault, JSON.stringify(updatedVault));
    return updatedVault;
  }

  public async addOwner(owner: Owner, ownerAdded: Owner): Promise<Vault> {
    const currentVault = await this.get(owner.seed);
    if (!currentVault) throw new Error("No vault found on this owner");

    if (
      currentVault.owners.find(
        (owner) => owner.identifier === ownerAdded.identifier
      )
    ) {
      throw new Error("Owner already imported");
    }

    const addedOwnerVault = await this.get(ownerAdded.seed);
    if (addedOwnerVault) {
      return await this.merge(owner, ownerAdded);
    }

    const updatedVault = {
      ...currentVault,
      owners: [...currentVault.owners, ownerAdded],
    };
    await this.post(updatedVault, JSON.stringify(updatedVault));
    return updatedVault;
  }

  public async deleteOwners(
    owner: Owner,
    ownersDeleted: Owner[]
  ): Promise<Vault> {
    const currentVault = await this.get(owner.seed);
    if (!currentVault) throw new Error("No vault found on this owner");

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
        this.provider.post(ownerDeleted.seed, "deleted", currentVault.version)
      )
    );

    const updatedVault = {
      ...currentVault,
      owners: owners,
    };
    await this.post(updatedVault, JSON.stringify(updatedVault));
    return updatedVault;
  }

  public async updateAutoImportOwners(
    owner: Owner,
    autoImportOwners: boolean
  ): Promise<Vault> {
    const currentVault = await this.get(owner.seed);
    if (!currentVault) throw new Error("No vault found on this owner");
    const updatedVault = {
      ...currentVault,
      settings: {
        ...currentVault.settings,
        autoImportOwners: autoImportOwners,
      },
    };
    await this.post(updatedVault, JSON.stringify(updatedVault));
    return updatedVault;
  }

  public async updateKeepConnected(
    owner: Owner,
    keepConnected: boolean
  ): Promise<Vault> {
    const currentVault = await this.get(owner.seed);
    if (!currentVault) throw new Error("No vault found on this owner");
    const updatedVault = {
      ...currentVault,
      settings: {
        ...currentVault.settings,
        keepConnected: keepConnected,
      },
    };
    await this.post(updatedVault, JSON.stringify(updatedVault));
    return updatedVault;
  }
  /************************* CUSTOMIZATION **********************/

  public async updateName(owner: Owner, name: string): Promise<Vault> {
    const currentVault = await this.get(owner.seed);
    if (!currentVault) throw new Error("No vault found on this owner");

    const updatedVault = {
      ...currentVault,
      settings: {
        ...currentVault.settings,
        name: name,
      },
    };

    await this.post(updatedVault, JSON.stringify(updatedVault));
    return updatedVault;
  }

  /*****************************************************************/
  /***************************** DELETE ****************************/
  /*****************************************************************/

  public async delete(owner: Owner): Promise<void> {
    const currentVault = await this.get(owner.seed);
    if (currentVault.mnemonics && currentVault.mnemonics.length > 0) {
      throw new Error("Can't delete this vault");
    }
    await this.post(currentVault, "deleted");
  }

  /*****************************************************************/
  /***************************** UTILS *****************************/
  /*****************************************************************/

  //Post to all owners
  private async post(vault: Vault, text: string): Promise<void> {
    await Promise.all([
      ...vault.owners.map((owner) =>
        this.provider.post(owner.seed, text, vault.version)
      ),
      ...vault.recoveryKeys
        .filter((backup) => backup.valid)
        .map((backup) => this.provider.post(backup.key, text, vault.version)),
    ]);
  }

  //Get vault with right version
  private async get(seed: string): Promise<Vault> {
    const vaultString = await this.provider.get(seed);
    if (vaultString === "deleted") return null;
    let vault = JSON.parse(vaultString);
    return migration(vault);
  }
}
