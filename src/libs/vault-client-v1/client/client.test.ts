import { EddsaPublicKey, EddsaSignature } from "@sismo-core/hydra-s2";
import { BigNumber } from "ethers";
import { RecoveryKey, ImportedAccount, Owner, VaultClient } from ".";
import { LocalStore } from "../stores/local-store";

describe("Vault client V1", () => {
  let vaultClient: VaultClient;
  let mnemonic1: string;
  let owner1: Owner;
  let owner2: Owner;
  let owner3: Owner;
  let owner4: Owner;
  let github1: ImportedAccount;
  let account1: ImportedAccount;
  let account2: ImportedAccount;
  let recoveryKey1: RecoveryKey;
  let recoveryKey2: RecoveryKey;
  let recoveryKeyAdded: RecoveryKey;

  beforeAll(() => {
    const localStore = new LocalStore();
    vaultClient = new VaultClient(localStore);
    const commitmentReceipt: EddsaSignature = [
      BigNumber.from(1),
      BigNumber.from(2),
      BigNumber.from(3),
    ];
    const commitmentMapperPubKey: EddsaPublicKey = [
      BigNumber.from(1),
      BigNumber.from(2),
    ];
    owner1 = {
      identifier: "0x1",
      seed: "0x10",
      timestamp: 1666532889777,
    };
    owner2 = {
      identifier: "0x2",
      seed: "0x20",
      timestamp: 1666532889777,
    };
    owner3 = {
      identifier: "0x3",
      seed: "0x30",
      timestamp: 1666532889777,
    };
    owner4 = {
      identifier: "0x4",
      seed: "0x40",
      timestamp: 1666532889777,
    };
    account1 = {
      identifier: "0x13",
      seed: "0x130",
      commitmentReceipt: commitmentReceipt,
      commitmentMapperPubKey: commitmentMapperPubKey,
      type: "ethereum",
      timestamp: 1666532889777,
    };
    account2 = {
      identifier: "0x14",
      seed: "0x140",
      commitmentReceipt: commitmentReceipt,
      commitmentMapperPubKey: commitmentMapperPubKey,
      type: "ethereum",
      timestamp: 1666532889777,
    };
    github1 = {
      identifier: "0x142",
      seed: "0x140",
      commitmentReceipt: commitmentReceipt,
      commitmentMapperPubKey: commitmentMapperPubKey,
      type: "github",
      timestamp: 1666532889777,
    };
  });

  /*****************************************************************/
  /****************************** CREATE ***************************/
  /*****************************************************************/

  it("Should create a new vault", async () => {
    const vault = await vaultClient.create();
    mnemonic1 = vault.mnemonics[0];
    expect(vault).toEqual({
      mnemonics: [mnemonic1],
      importedAccounts: [],
      recoveryKeys: [],
      owners: [],
      settings: {
        name: "My Sismo Vault",
        autoImportOwners: true,
        keepConnected: true,
      },
      timestamp: vault.timestamp,
      version: 4,
    });
  });

  it("Should add a owner in the vault to save it", async () => {
    const vault = await vaultClient.addOwner(owner1);
    expect(vault).toEqual({
      mnemonics: [mnemonic1],
      importedAccounts: [],
      recoveryKeys: [],
      owners: [owner1],
      settings: {
        name: "My Sismo Vault",
        autoImportOwners: true,
        keepConnected: true,
      },
      timestamp: vault.timestamp,
      version: 4,
    });
  });

  it("Should lock and retrieve the vault thanks to the owner", async () => {
    vaultClient.lock();
    const vault = await vaultClient.unlock(owner1.seed);
    expect(vault).toEqual({
      mnemonics: [mnemonic1],
      importedAccounts: [],
      recoveryKeys: [],
      owners: [owner1],
      settings: {
        name: "My Sismo Vault",
        autoImportOwners: true,
        keepConnected: true,
      },
      timestamp: vault.timestamp,
      version: 4,
    });
  });

  /*****************************************************************/
  /************************ RECOVERY KEYS **************************/
  /*****************************************************************/

  it("Should generate recovery key", async () => {
    await vaultClient.unlock(owner1.seed);
    const vault = await vaultClient.generateRecoveryKey("RecoveryKey1");
    recoveryKey1 = vault.recoveryKeys[0];
    vaultClient.lock();
    const vaultBacked = await vaultClient.unlock(recoveryKey1.key);
    expect(vaultBacked).toEqual(vault);
  });

  it("Should add a predefined recovery key", async () => {
    await vaultClient.unlock(owner1.seed);
    recoveryKeyAdded = {
      key: "0x1",
      mnemonic: "mnemonic recovery key",
      accountNumber: 0,
      valid: true,
      name: "Recovery key added",
      timestamp: 0,
    };
    const vault = await vaultClient.addRecoveryKey(recoveryKeyAdded);
    vaultClient.lock();
    const vaultBacked = await vaultClient.unlock(recoveryKeyAdded.key);
    vaultClient.lock();
    expect(vaultBacked).toEqual(vault);
  });

  it("Should generate a second recovery key", async () => {
    await vaultClient.unlock(owner1.seed);
    const vault = await vaultClient.generateRecoveryKey("RecoveryKey2");
    recoveryKey2 = vault.recoveryKeys[2];
    vaultClient.lock();
    const vaultBacked = await vaultClient.unlock(recoveryKey2.key);
    expect(vaultBacked).toEqual(vault);
  });

  it("Should disable the first recovery key", async () => {
    await vaultClient.unlock(owner1.seed);
    await vaultClient.disableRecoveryKey(recoveryKey1.key);
    recoveryKey1.valid = false;
    vaultClient.lock();
    const vault = await vaultClient.unlock(recoveryKey1.key);
    expect(vault).toEqual(null);
  });

  /*****************************************************************/
  /*************************** SETTINGS ****************************/
  /*****************************************************************/

  it("Should update keepConnected to false", async () => {
    await vaultClient.unlock(owner1.seed);
    const vault = await vaultClient.setKeepConnected(false);
    expect(vault).toEqual({
      mnemonics: [mnemonic1],
      importedAccounts: [],
      recoveryKeys: [recoveryKey1, recoveryKeyAdded, recoveryKey2],
      owners: [owner1],
      settings: {
        name: "My Sismo Vault",
        autoImportOwners: true,
        keepConnected: false,
      },
      timestamp: vault.timestamp,
      version: 4,
    });
  });

  it("Should update keepConnected to true", async () => {
    await vaultClient.unlock(owner1.seed);
    const vault = await vaultClient.setKeepConnected(true);
    expect(vault).toEqual({
      mnemonics: [mnemonic1],
      importedAccounts: [],
      recoveryKeys: [recoveryKey1, recoveryKeyAdded, recoveryKey2],
      owners: [owner1],
      settings: {
        name: "My Sismo Vault",
        autoImportOwners: true,
        keepConnected: true,
      },
      timestamp: vault.timestamp,
      version: 4,
    });
  });

  it("Should update autoImportOwners to false", async () => {
    await vaultClient.unlock(owner1.seed);
    const vault = await vaultClient.setAutoImportOwners(false);
    expect(vault).toEqual({
      mnemonics: [mnemonic1],
      importedAccounts: [],
      recoveryKeys: [recoveryKey1, recoveryKeyAdded, recoveryKey2],
      owners: [owner1],
      settings: {
        name: "My Sismo Vault",
        autoImportOwners: false,
        keepConnected: true,
      },
      timestamp: vault.timestamp,
      version: 4,
    });
  });

  it("Should update name of the vault", async () => {
    await vaultClient.unlock(owner1.seed);
    const vault = await vaultClient.updateName("My vault name 2");
    expect(vault).toEqual({
      mnemonics: [mnemonic1],
      importedAccounts: [],
      recoveryKeys: [recoveryKey1, recoveryKeyAdded, recoveryKey2],
      owners: [owner1],
      settings: {
        name: "My vault name 2",
        autoImportOwners: false,
        keepConnected: true,
      },
      timestamp: vault.timestamp,
      version: 4,
    });
  });

  it("Should put back the old name of the vault", async () => {
    await vaultClient.unlock(owner1.seed);
    const vault = await vaultClient.updateName("My Sismo Vault");
    expect(vault).toEqual({
      mnemonics: [mnemonic1],
      importedAccounts: [],
      recoveryKeys: [recoveryKey1, recoveryKeyAdded, recoveryKey2],
      owners: [owner1],
      settings: {
        name: "My Sismo Vault",
        autoImportOwners: false,
        keepConnected: true,
      },
      timestamp: vault.timestamp,
      version: 4,
    });
  });

  /*****************************************************************/
  /************************* IMPORTED ACCOUNTS *********************/
  /*****************************************************************/

  it("Should import an account", async () => {
    await vaultClient.unlock(owner1.seed);
    const vault = await vaultClient.importAccount(account1);
    expect(JSON.stringify(vault)).toEqual(
      JSON.stringify({
        mnemonics: [mnemonic1],
        importedAccounts: [account1],
        recoveryKeys: [recoveryKey1, recoveryKeyAdded, recoveryKey2],
        owners: [owner1],
        settings: {
          autoImportOwners: false,
          name: "My Sismo Vault",
          keepConnected: true,
        },
        timestamp: vault.timestamp,
        version: 4,
      })
    );
  });

  it("Should import second account", async () => {
    await vaultClient.unlock(owner1.seed);
    const vault = await vaultClient.importAccount(account2);
    expect(JSON.stringify(vault)).toEqual(
      JSON.stringify({
        mnemonics: [mnemonic1],
        importedAccounts: [account1, account2],
        recoveryKeys: [recoveryKey1, recoveryKeyAdded, recoveryKey2],
        owners: [owner1],
        settings: {
          autoImportOwners: false,
          name: "My Sismo Vault",
          keepConnected: true,
        },
        timestamp: vault.timestamp,
        version: 4,
      })
    );
  });

  it("Should throw when adding a account already imported", async () => {
    await expect(async () => {
      await vaultClient.unlock(owner1.seed);
      await vaultClient.importAccount(account2);
    }).rejects.toThrow();
  });

  it("Should remove the first account", async () => {
    await vaultClient.unlock(owner1.seed);
    const vault = await vaultClient.deleteImportedAccount(account1);
    expect(JSON.stringify(vault)).toEqual(
      JSON.stringify({
        mnemonics: [mnemonic1],
        importedAccounts: [account2],
        recoveryKeys: [recoveryKey1, recoveryKeyAdded, recoveryKey2],
        owners: [owner1],
        settings: {
          autoImportOwners: false,
          name: "My Sismo Vault",
          keepConnected: true,
        },
        timestamp: vault.timestamp,
        version: 4,
      })
    );
  });

  it("Should throw when removing an account which is not in the vault", async () => {
    await expect(async () => {
      await vaultClient.unlock(owner1.seed);
      await vaultClient.deleteImportedAccount(account1);
    }).rejects.toThrow();
  });

  it("Should throw when adding github account without a wallet", async () => {
    await expect(async () => {
      await vaultClient.unlock(owner1.seed);
      await vaultClient.importAccount({
        ...github1,
        profile: {
          login: "login",
          id: 123,
          name: "name",
          avatar: "avatar",
        },
      });
    }).rejects.toThrow();
  });

  it("Should throw when adding github account without a profile", async () => {
    await expect(async () => {
      await vaultClient.unlock(owner1.seed);
      await vaultClient.importAccount({
        ...github1,
        wallet: {
          mnemonic: "mnemonic",
          accountNumber: 0,
        },
      });
    }).rejects.toThrow();
  });

  it("Should throw with incorrect mnemonic", async () => {
    await expect(async () => {
      await vaultClient.unlock(owner1.seed);
      await vaultClient.importAccount({
        ...github1,
        profile: {
          login: "login",
          id: 123,
          name: "name",
          avatar: "avatar",
        },
        wallet: {
          mnemonic: "mnemonic",
          accountNumber: 0,
        },
      });
    }).rejects.toThrow();
  });

  it("Should throw with incorrect accountNumber", async () => {
    const vault = await vaultClient.unlock(owner1.seed);
    await expect(async () => {
      await vaultClient.importAccount({
        ...github1,
        profile: {
          login: "login",
          id: 123,
          name: "name",
          avatar: "avatar",
        },
        wallet: {
          mnemonic: vault.mnemonics[0],
          accountNumber: 24,
        },
      });
    }).rejects.toThrow();
  });

  it("Should import github account", async () => {
    const vault = await vaultClient.unlock(owner1.seed);
    github1 = {
      ...github1,
      profile: {
        login: "login",
        id: 123,
        name: "name",
        avatar: "avatar",
      },
      wallet: {
        mnemonic: vault.mnemonics[0],
        accountNumber: 0,
      },
    };
    const vaultRes = await vaultClient.importAccount(github1);
    expect(JSON.stringify(vaultRes)).toEqual(
      JSON.stringify({
        mnemonics: [mnemonic1],
        importedAccounts: [account2, github1],
        recoveryKeys: [recoveryKey1, recoveryKeyAdded, recoveryKey2],
        owners: [owner1],
        settings: {
          autoImportOwners: false,
          name: "My Sismo Vault",
          keepConnected: true,
        },
        timestamp: vault.timestamp,
        version: 4,
      })
    );
  });

  /*****************************************************************/
  /****************************** OWNERS ***************************/
  /*****************************************************************/

  it("Should import a owner", async () => {
    await vaultClient.unlock(owner1.seed);
    const vault = await vaultClient.addOwner(owner2);
    expect(JSON.stringify(vault)).toEqual(
      JSON.stringify({
        mnemonics: [mnemonic1],
        importedAccounts: [account2, github1],
        recoveryKeys: [recoveryKey1, recoveryKeyAdded, recoveryKey2],
        owners: [owner1, owner2],
        settings: {
          autoImportOwners: false,
          name: "My Sismo Vault",
          keepConnected: true,
        },
        timestamp: vault.timestamp,
        version: 4,
      })
    );
  });

  it("Should import second owner", async () => {
    await vaultClient.unlock(owner1.seed);
    const vault = await vaultClient.addOwner(owner3);
    expect(JSON.stringify(vault)).toEqual(
      JSON.stringify({
        mnemonics: [mnemonic1],
        importedAccounts: [account2, github1],
        recoveryKeys: [recoveryKey1, recoveryKeyAdded, recoveryKey2],
        owners: [owner1, owner2, owner3],
        settings: {
          autoImportOwners: false,
          name: "My Sismo Vault",
          keepConnected: true,
        },
        timestamp: vault.timestamp,
        version: 4,
      })
    );
  });

  it("Should throw when adding an owner already imported", async () => {
    await expect(async () => {
      await vaultClient.unlock(owner1.seed);
      await vaultClient.addOwner(owner3);
    }).rejects.toThrow();
  });

  it("Should throw when adding an owner with a vault", async () => {
    await expect(async () => {
      await vaultClient.addOwner(owner3);
    }).rejects.toThrow();
  });

  it("Should remove the third owner", async () => {
    await vaultClient.unlock(owner1.seed);
    const vault = await vaultClient.deleteOwners([owner3]);
    expect(JSON.stringify(vault)).toEqual(
      JSON.stringify({
        mnemonics: [mnemonic1],
        importedAccounts: [account2, github1],
        recoveryKeys: [recoveryKey1, recoveryKeyAdded, recoveryKey2],
        owners: [owner1, owner2],
        settings: {
          autoImportOwners: false,
          name: "My Sismo Vault",
          keepConnected: true,
        },
        timestamp: vault.timestamp,
        version: 4,
      })
    );
  });

  it("Should throw when removing an owner which is not in the vault", async () => {
    await expect(async () => {
      await vaultClient.unlock(owner1.seed);
      await vaultClient.deleteOwners([owner4]);
    }).rejects.toThrow();
  });
});
