import { EddsaPublicKey, EddsaSignature } from "@sismo-core/hydra-s1";
import { BigNumber, Wallet } from "ethers";
import { RecoveryKey, ImportedAccount, Owner, VaultClient } from ".";
import { LocalStore } from "../stores/local-store";

describe("Vault client V1", () => {
  let vaultClient: VaultClient;
  let mnemonic1: string;
  let mnemonic2: string;
  let owner1: Owner;
  let owner2: Owner;
  let owner3: Owner;
  let owner4: Owner;
  let github1: ImportedAccount;
  let account1: ImportedAccount;
  let account2: ImportedAccount;
  let account5: ImportedAccount;
  let recoveryKey1: RecoveryKey;
  let recoveryKey2: RecoveryKey;

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
    account5 = {
      identifier: "0x151",
      seed: "0x1501",
      type: "ethereum",
      commitmentReceipt: commitmentReceipt,
      commitmentMapperPubKey: commitmentMapperPubKey,
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

  it("Should create a new vault from owner", async () => {
    await vaultClient.createFromOwner(owner1, "My vault");
    const vault = await vaultClient.load(owner1.seed);
    expect(vault).toEqual({
      mnemonics: [],
      importedAccounts: [],
      recoveryKeys: [],
      owners: [owner1],
      settings: {
        name: "My vault",
        autoImportOwners: true,
        keepConnected: true,
      },
      timestamp: vault.timestamp,
      version: 4,
    });
  });

  it("Should create a new vault from recovery", async () => {
    const recoveryKey = await vaultClient.getRecoveryKey();
    await vaultClient.createFromRecoveryKey(recoveryKey, "My vault");
    const vault = await vaultClient.load(recoveryKey.key);
    expect(vault).toEqual({
      mnemonics: [recoveryKey.mnemonic],
      importedAccounts: [],
      recoveryKeys: [recoveryKey],
      owners: [],
      settings: {
        name: "My vault",
        autoImportOwners: true,
        keepConnected: true,
      },
      timestamp: vault.timestamp,
      version: 4,
    });
  });

  /*****************************************************************/
  /**************************** MNEMONIC ***************************/
  /*****************************************************************/

  it("Should throw when create recoveryKey without mnemonic", async () => {
    await expect(async () => {
      await vaultClient.generateRecoveryKey(owner1, "RecoveryKey1");
    }).rejects.toThrow();
  });

  it("Should add new mnemonic in the vault", async () => {
    await vaultClient.generateMnemonic(owner1);
    const vault = await vaultClient.load(owner1.seed);
    mnemonic1 = vault.mnemonics[0];
    Wallet.fromMnemonic(mnemonic1);
    expect(vault).toEqual({
      mnemonics: [mnemonic1],
      importedAccounts: [],
      recoveryKeys: [],
      owners: [owner1],
      settings: {
        name: "My vault",
        autoImportOwners: true,
        keepConnected: true,
      },
      timestamp: vault.timestamp,
      version: 4,
    });
  });

  it("Should throw when mnemonic already generated", async () => {
    await expect(async () => {
      await vaultClient.generateMnemonic(owner1);
    }).rejects.toThrow();
  });

  /*****************************************************************/
  /************************** recoveryKeys ***************************/
  /*****************************************************************/

  it("Should generate backup key", async () => {
    await vaultClient.generateRecoveryKey(owner1, "RecoveryKey1");
    const vault = await vaultClient.load(owner1.seed);
    recoveryKey1 = vault.recoveryKeys[0];
    const vaultBacked = await vaultClient.load(recoveryKey1.key);
    expect(vaultBacked).toEqual(vault);
  });

  it("Should generate a recovery key", async () => {
    const recovery = await vaultClient.getRecoveryKey(mnemonic1, 0);
    expect(typeof recovery.name).toBe("string");
    expect(typeof recovery.key).toBe("string");
    expect(recovery.mnemonic.split(" ").length).toEqual(12);
    expect(recovery.accountNumber).toEqual(0);
    expect(recovery.valid).toEqual(true);
    expect(typeof recovery.timestamp).toBe("number");
  });

  /*****************************************************************/
  /**************************** OPTIONS ****************************/
  /*****************************************************************/

  it("Should update autoImportOwners to false", async () => {
    await vaultClient.updateAutoImportOwners(owner1, false);
    const vault = await vaultClient.load(owner1.seed);
    expect(vault).toEqual({
      mnemonics: [mnemonic1],
      importedAccounts: [],
      recoveryKeys: [recoveryKey1],
      owners: [owner1],
      settings: {
        name: "My vault",
        autoImportOwners: false,
        keepConnected: true,
      },
      timestamp: vault.timestamp,
      version: 4,
    });
  });

  it("Should update name of the vault", async () => {
    await vaultClient.updateName(owner1, "My vault name 2");
    const vault = await vaultClient.load(owner1.seed);
    expect(vault).toEqual({
      mnemonics: [mnemonic1],
      importedAccounts: [],
      recoveryKeys: [recoveryKey1],
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
    await vaultClient.updateName(owner1, "My vault");
    const vault = await vaultClient.load(owner1.seed);
    expect(vault).toEqual({
      mnemonics: [mnemonic1],
      importedAccounts: [],
      recoveryKeys: [recoveryKey1],
      owners: [owner1],
      settings: {
        name: "My vault",
        autoImportOwners: false,
        keepConnected: true,
      },
      timestamp: vault.timestamp,
      version: 4,
    });
  });

  /*****************************************************************/
  /************************** importedAccounts *********************/
  /*****************************************************************/

  it("Should import an account", async () => {
    await vaultClient.importAccount(owner1, account1);
    const vault = await vaultClient.load(owner1.seed);
    expect(JSON.stringify(vault)).toEqual(
      JSON.stringify({
        mnemonics: [mnemonic1],
        importedAccounts: [account1],
        recoveryKeys: [recoveryKey1],
        owners: [owner1],
        settings: {
          autoImportOwners: false,
          name: "My vault",
          keepConnected: true,
        },
        timestamp: vault.timestamp,
        version: 4,
      })
    );
  });

  it("Should import second account", async () => {
    await vaultClient.importAccount(owner1, account2);
    const vault = await vaultClient.load(owner1.seed);
    expect(JSON.stringify(vault)).toEqual(
      JSON.stringify({
        mnemonics: [mnemonic1],
        importedAccounts: [account1, account2],
        recoveryKeys: [recoveryKey1],
        owners: [owner1],
        settings: {
          autoImportOwners: false,
          name: "My vault",
          keepConnected: true,
        },
        timestamp: vault.timestamp,
        version: 4,
      })
    );
  });

  it("Should throw when adding a account already imported", async () => {
    await expect(async () => {
      await vaultClient.importAccount(owner1, account2);
    }).rejects.toThrow();
  });

  it("Should remove the first account", async () => {
    await vaultClient.deleteImportedAccount(owner1, account1);
    const vault = await vaultClient.load(owner1.seed);
    expect(JSON.stringify(vault)).toEqual(
      JSON.stringify({
        mnemonics: [mnemonic1],
        importedAccounts: [account2],
        recoveryKeys: [recoveryKey1],
        owners: [owner1],
        settings: {
          autoImportOwners: false,
          name: "My vault",
          keepConnected: true,
        },
        timestamp: vault.timestamp,
        version: 4,
      })
    );
  });

  it("Should throw when removing an account which is not in the vault", async () => {
    await expect(async () => {
      await vaultClient.deleteImportedAccount(owner1, account1);
    }).rejects.toThrow();
  });

  it("Should throw when adding github account without a wallet", async () => {
    await expect(async () => {
      await vaultClient.importAccount(owner1, {
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
      await vaultClient.importAccount(owner1, {
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
      await vaultClient.importAccount(owner1, {
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
    const vault = await vaultClient.load(owner1.seed);
    await expect(async () => {
      await vaultClient.importAccount(owner1, {
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
    const vault = await vaultClient.load(owner1.seed);
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
    const vaultRes = await vaultClient.importAccount(owner1, github1);
    expect(JSON.stringify(vaultRes)).toEqual(
      JSON.stringify({
        mnemonics: [mnemonic1],
        importedAccounts: [account2, github1],
        recoveryKeys: [recoveryKey1],
        owners: [owner1],
        settings: {
          autoImportOwners: false,
          name: "My vault",
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

  /**************************** ADD **************************/

  it("Should import a owner", async () => {
    await vaultClient.addOwner(owner1, owner2);
    const vault = await vaultClient.load(owner1.seed);
    expect(JSON.stringify(vault)).toEqual(
      JSON.stringify({
        mnemonics: [mnemonic1],
        importedAccounts: [account2, github1],
        recoveryKeys: [recoveryKey1],
        owners: [owner1, owner2],
        settings: {
          autoImportOwners: false,
          name: "My vault",
          keepConnected: true,
        },
        timestamp: vault.timestamp,
        version: 4,
      })
    );
  });

  it("Should import second owner", async () => {
    await vaultClient.addOwner(owner1, owner3);
    const vault = await vaultClient.load(owner1.seed);
    expect(JSON.stringify(vault)).toEqual(
      JSON.stringify({
        mnemonics: [mnemonic1],
        importedAccounts: [account2, github1],
        recoveryKeys: [recoveryKey1],
        owners: [owner1, owner2, owner3],
        settings: {
          autoImportOwners: false,
          name: "My vault",
          keepConnected: true,
        },
        timestamp: vault.timestamp,
        version: 4,
      })
    );
  });

  it("Should throw when adding an owner already imported", async () => {
    await expect(async () => {
      await vaultClient.addOwner(owner1, owner3);
    }).rejects.toThrow();
  });

  it("Should throw when adding an owner with a vault", async () => {
    await expect(async () => {
      await vaultClient.addOwner(owner1, owner3);
    }).rejects.toThrow();
  });

  /**************************** DELETE **************************/

  it("Should remove the third owner", async () => {
    await vaultClient.deleteOwners(owner1, [owner3]);
    const vault = await vaultClient.load(owner1.seed);
    expect(JSON.stringify(vault)).toEqual(
      JSON.stringify({
        mnemonics: [mnemonic1],
        importedAccounts: [account2, github1],
        recoveryKeys: [recoveryKey1],
        owners: [owner1, owner2],
        settings: {
          autoImportOwners: false,
          name: "My vault",
          keepConnected: true,
        },
        timestamp: vault.timestamp,
        version: 4,
      })
    );
  });

  it("Should throw when removing an owner which is not in the vault", async () => {
    await expect(async () => {
      await vaultClient.deleteOwners(owner1, [owner4]);
    }).rejects.toThrow();
  });

  /**************************** MERGE **************************/

  it("Should merge 2 vaults with mnemonic", async () => {
    const vault1Before = await vaultClient.load(owner1.seed);
    expect(JSON.stringify(vault1Before.importedAccounts)).toEqual(
      JSON.stringify([account2, github1])
    );
    await vaultClient.createFromOwner(owner3, "My Vault 3");
    await vaultClient.importAccount(owner3, account5);
    await vaultClient.generateMnemonic(owner3);
    const vaultOwner3 = await vaultClient.generateRecoveryKey(
      owner3,
      "recoveryKey2"
    );
    recoveryKey2 = vaultOwner3.recoveryKeys[0];
    await vaultClient.addOwner(owner1, owner3);
    const vault1 = await vaultClient.load(owner1.seed);
    const vault2 = await vaultClient.load(owner2.seed);
    const vault3 = await vaultClient.load(owner3.seed);
    const vaultBackup1 = await vaultClient.load(recoveryKey1.key);
    const vaultBackup2 = await vaultClient.load(recoveryKey2.key);

    expect(JSON.stringify(vault1)).toEqual(JSON.stringify(vault2));
    expect(JSON.stringify(vault1)).toEqual(JSON.stringify(vault3));
    expect(JSON.stringify(vault1)).toEqual(JSON.stringify(vaultBackup1));
    expect(JSON.stringify(vault1)).toEqual(JSON.stringify(vaultBackup2));

    expect(JSON.stringify(vault1.recoveryKeys)).toEqual(
      JSON.stringify([recoveryKey1, recoveryKey2])
    );

    expect(JSON.stringify(vault1.owners)).toEqual(
      JSON.stringify([owner1, owner2, owner3])
    );
    expect(JSON.stringify(vault1.importedAccounts)).toEqual(
      JSON.stringify([account2, github1, account5])
    );
    expect(vault1.mnemonics[0]).toEqual(mnemonic1);
  });

  it("Should merge 2 vaults without mnemonic", async () => {
    await vaultClient.createFromOwner(owner4, "My Vault 4");
    const vaultWithMnemonic = await vaultClient.generateMnemonic(owner4);
    mnemonic2 = vaultWithMnemonic.mnemonics[0];
    Wallet.fromMnemonic(mnemonic2);
    await vaultClient.addOwner(owner4, owner2);
    const vault1 = await vaultClient.load(owner1.seed);
    const vault2 = await vaultClient.load(owner2.seed);
    const vault3 = await vaultClient.load(owner3.seed);
    const vault4 = await vaultClient.load(owner4.seed);
    const vaultBackup1 = await vaultClient.load(recoveryKey1.key);
    const vaultBackup2 = await vaultClient.load(recoveryKey2.key);

    expect(JSON.stringify(vault1)).toEqual(JSON.stringify(vault2));
    expect(JSON.stringify(vault1)).toEqual(JSON.stringify(vault3));
    expect(JSON.stringify(vault1)).toEqual(JSON.stringify(vault4));
    expect(JSON.stringify(vault1)).toEqual(JSON.stringify(vaultBackup1));
    expect(JSON.stringify(vault1)).toEqual(JSON.stringify(vaultBackup2));

    expect(JSON.stringify(vault1.owners)).toEqual(
      JSON.stringify([owner4, owner1, owner2, owner3])
    );
    expect(JSON.stringify(vault1.importedAccounts)).toEqual(
      JSON.stringify([account2, github1, account5])
    );
    expect(vault1.mnemonics[0]).toEqual(mnemonic2);
    expect(vault1.mnemonics[1]).toEqual(mnemonic1);
  });
});
