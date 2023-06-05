import { LocalCommitmentMapper } from "../../commitment-mapper";
import {
  ImportedAccount,
  Owner,
  RecoveryKey,
  Vault,
  VaultClient as VaultClientV1,
} from "../../vault-client-v1";
import { LocalStore } from "../../vault-client-v1/stores/local-store";
import { VaultClient as VaultClientV2 } from "../../vault-client-v2";
import { isAccountInVault } from "../utils/isAccountInVault";
import { isOwnerInVault } from "../utils/isOwnerInVault";
import { isRecoveryKeyInVault } from "../utils/isRecoveryKeyInVault";
import { VaultsSynchronizer } from "../vaults-synchronizer";

describe("Vaults Synchronizer", () => {
  let storeV1: LocalStore;
  let vaultClientV1: VaultClientV1;
  let storeV2: LocalStore;
  let vaultClientV2: VaultClientV2;
  let owner1: Owner;
  let owner2: Owner;
  let owner3: Owner;
  let github1: ImportedAccount;
  let account1: ImportedAccount;
  let account2: ImportedAccount;
  let account3: ImportedAccount;
  let account4: ImportedAccount;
  let recoveryKey1: RecoveryKey;
  let recoveryKey2: RecoveryKey;
  let recoveryKey3: RecoveryKey;
  let vaultSynchronizer: VaultsSynchronizer;

  const init = () => {
    storeV1 = new LocalStore();
    vaultClientV1 = new VaultClientV1(storeV1);

    storeV2 = new LocalStore();
    vaultClientV2 = new VaultClientV2(storeV2);

    vaultSynchronizer = new VaultsSynchronizer({
      commitmentMapperV1: new LocalCommitmentMapper(),
      commitmentMapperV2: new LocalCommitmentMapper(),
      vaultClientV2,
      vaultClientV1,
    });
    owner1 = {
      identifier: "0x0111",
      seed: "0x01111",
      timestamp: 1666532889777,
    };
    owner2 = {
      identifier: "0x0222",
      seed: "0x02222",
      timestamp: 1666532889777,
    };
    owner3 = {
      identifier: "0x0333",
      seed: "0x03333",
      timestamp: 1666532889777,
    };
    account1 = {
      identifier: "0x1111",
      seed: "0x11111",
      commitmentReceipt: null,
      commitmentMapperPubKey: null,
      type: "ethereum",
      timestamp: 1666532889777,
    };
    account2 = {
      identifier: "0x1222",
      seed: "0x12222",
      commitmentReceipt: null,
      commitmentMapperPubKey: null,
      type: "ethereum",
      timestamp: 1666532889777,
    };
    account3 = {
      identifier: "0x1333",
      seed: "0x13333",
      commitmentReceipt: null,
      commitmentMapperPubKey: null,
      type: "ethereum",
      timestamp: 1666532889777,
    };
    account4 = {
      identifier: "0x1444",
      seed: "0x14444",
      commitmentReceipt: null,
      commitmentMapperPubKey: null,
      type: "ethereum",
      timestamp: 1666532889777,
    };
    github1 = {
      identifier: "0x2111",
      seed: "0x21111",
      commitmentReceipt: null,
      commitmentMapperPubKey: null,
      type: "github",
      timestamp: 1666532889777,
      profile: {
        login: "login",
        id: 123,
        name: "name",
        avatar: "avatar",
      },
      wallet: {
        mnemonic: null,
        accountNumber: 0,
      },
    };
  };

  /*****************************************************************/
  /***************************** CASE 0 ****************************/
  /*****************************************************************/

  describe("case 0", () => {
    beforeAll(() => {
      init();
    });
    it("Should return null providing no connected owners", async () => {
      const res = await vaultSynchronizer.sync(null, null);
      expect(res).toEqual(null);
    });
  });

  /*****************************************************************/
  /***************************** CASE 1 ****************************/
  /*****************************************************************/

  /*
   * Description
   * A user is connected on the Minting App but not connected on the
   * Vault App
   *
   * Expected behavior
   * Should create a new VaultV2 and import the VaultV1 in it
   */

  describe("case 1", () => {
    beforeAll(async () => {
      init();

      // Setup VaultV1
      let vault = await vaultClientV1.create();
      await vaultClientV1.addOwner(owner1);
      await vaultClientV1.importAccount(account1);
      await vaultClientV1.importAccount(account2);
      github1.wallet.mnemonic = vault.mnemonics[0];
      await vaultClientV1.importAccount(github1);
      vault = await vaultClientV1.generateRecoveryKey("Recovery 1");
      recoveryKey1 = vault.recoveryKeys[0];

      vaultClientV1.lock();
      vaultClientV2.lock();
    });

    it("Should create a new VaultV2 and import the VaultV1 in it", async () => {
      const { owner } = await vaultSynchronizer.sync(owner1, null);

      vaultClientV1.lock();
      vaultClientV2.lock();

      const vaultV1 = await vaultClientV1.unlock(owner.seed);
      const vaultV2 = await vaultClientV2.unlock(owner.seed);

      github1.wallet = vaultV2.importedAccounts[2].wallet;
      github1.seed = vaultV2.importedAccounts[2].seed;

      expect(isVaultsSync(vaultV1, vaultV2)).toEqual(true);
      expect(vaultV2).toEqual({
        mnemonics: vaultV2.mnemonics,
        importedAccounts: [account1, account2, github1],
        recoveryKeys: [recoveryKey1],
        owners: [owner1],
        settings: {
          name: "My Sismo Vault",
          autoImportOwners: true,
          keepConnected: true,
        },
        timestamp: vaultV2.timestamp,
        version: 4,
      });
    });
  });

  /*****************************************************************/
  /***************************** CASE 2 ****************************/
  /*****************************************************************/

  /*
   * Description
   * A user is connected on the Minting App but not connected on the
   * Vault App and the VaultV1 is already linked to a VaultV2
   *
   * Expected behavior
   * Should connect the VaultV2 and import VaultV1 in it
   */

  describe("case 2", () => {
    beforeAll(async () => {
      init();

      // Setup VaultV1
      let vault = await vaultClientV1.create();
      await vaultClientV1.addOwner(owner1);
      await vaultClientV1.importAccount(account1);
      await vaultClientV1.importAccount(account2);
      github1.wallet.mnemonic = vault.mnemonics[0];
      await vaultClientV1.importAccount(github1);

      // Setup VaultV2
      await vaultClientV2.create();
      await vaultClientV2.addOwner(owner1);
      await vaultClientV2.importAccount(account2);
      await vaultClientV2.importAccount(account3);
      vault = await vaultClientV2.generateRecoveryKey("Recovery 1");
      recoveryKey1 = vault.recoveryKeys[0];

      vaultClientV1.lock();
      vaultClientV2.lock();
    });

    it("Should connect the VaultV2 and import VaultV1 in it", async () => {
      const { owner } = await vaultSynchronizer.sync(owner1, null);

      vaultClientV1.lock();
      vaultClientV2.lock();

      const vaultV1 = await vaultClientV1.unlock(owner.seed);
      const vaultV2 = await vaultClientV2.unlock(owner.seed);

      github1.wallet = vaultV2.importedAccounts[3].wallet;
      github1.seed = vaultV2.importedAccounts[3].seed;

      expect(isVaultsSync(vaultV1, vaultV2)).toEqual(true);
      expect(vaultV2).toEqual({
        mnemonics: vaultV2.mnemonics,
        importedAccounts: [account2, account3, account1, github1],
        recoveryKeys: [recoveryKey1],
        owners: [owner1],
        settings: {
          name: "My Sismo Vault",
          autoImportOwners: true,
          keepConnected: true,
        },
        timestamp: vaultV2.timestamp,
        version: 4,
      });
    });
  });

  /*****************************************************************/
  /***************************** CASE 3 ****************************/
  /*****************************************************************/

  /*
   * Description
   * A user is connected on the Vault App but not connected on the
   * Minting App
   *
   * Expected behavior
   * Should create a new VaultV1 and import the VaultV2 in it
   */

  describe("case 3", () => {
    beforeAll(async () => {
      init();

      // Setup VaultV2
      let vault = await vaultClientV2.create();
      await vaultClientV2.addOwner(owner1);
      await vaultClientV2.importAccount(account1);
      await vaultClientV2.importAccount(account2);
      github1.wallet.mnemonic = vault.mnemonics[0];
      await vaultClientV2.importAccount(github1);

      vaultClientV2.lock();
      vaultClientV1.lock();
    });

    it("Should create a new VaultV1 and import the VaultV2 in it", async () => {
      const { owner } = await vaultSynchronizer.sync(null, owner1);

      vaultClientV1.lock();
      vaultClientV2.lock();

      const vaultV1 = await vaultClientV1.unlock(owner.seed);
      const vaultV2 = await vaultClientV2.unlock(owner.seed);

      github1.wallet = vaultV1.importedAccounts[2].wallet;
      github1.seed = vaultV1.importedAccounts[2].seed;

      expect(isVaultsSync(vaultV1, vaultV2)).toEqual(true);
      expect(vaultV1).toEqual({
        mnemonics: vaultV1.mnemonics,
        importedAccounts: [account1, account2, github1],
        recoveryKeys: [],
        owners: [owner1],
        settings: {
          name: "My Sismo Vault",
          autoImportOwners: true,
          keepConnected: true,
        },
        timestamp: vaultV1.timestamp,
        version: 4,
      });
    });
  });

  /*****************************************************************/
  /***************************** CASE 4 ****************************/
  /*****************************************************************/

  /*
   * Description
   * A user is connected on the Vault App but not on the
   * Minting App and the VaultV2 is already linked to a VaultV1
   *
   * Expected behavior
   * Should connect to VaultV2 and import VaultV1
   */

  describe("case 4", () => {
    beforeAll(async () => {
      init();

      // Setup VaultV1
      await vaultClientV1.create();
      await vaultClientV1.addOwner(owner1);
      await vaultClientV1.importAccount(account2);
      await vaultClientV1.importAccount(account3);
      let vault = await vaultClientV1.generateRecoveryKey("Recovery 1");
      recoveryKey1 = vault.recoveryKeys[0];

      // Setup VaultV2
      vault = await vaultClientV2.create();
      await vaultClientV2.addOwner(owner1);
      await vaultClientV2.importAccount(account1);
      await vaultClientV2.importAccount(account2);
      github1.wallet.mnemonic = vault.mnemonics[0];
      await vaultClientV2.importAccount(github1);
      vault = await vaultClientV2.generateRecoveryKey("Recovery 2");
      recoveryKey2 = vault.recoveryKeys[0];

      vaultClientV1.lock();
      vaultClientV2.lock();
    });

    it("Should connect to VaultV2 and import VaultV1", async () => {
      const { owner } = await vaultSynchronizer.sync(null, owner1);

      vaultClientV1.lock();
      vaultClientV2.lock();
      const vaultV1 = await vaultClientV1.unlock(owner.seed);
      const vaultV2 = await vaultClientV2.unlock(owner.seed);

      github1.wallet = vaultV1.importedAccounts[3].wallet;
      github1.seed = vaultV1.importedAccounts[3].seed;

      expect(isVaultsSync(vaultV1, vaultV2)).toEqual(true);
      expect(vaultV1).toEqual({
        mnemonics: vaultV1.mnemonics,
        importedAccounts: [account2, account3, account1, github1],
        recoveryKeys: [recoveryKey1, recoveryKey2],
        owners: [owner1],
        settings: {
          name: "My Sismo Vault",
          autoImportOwners: true,
          keepConnected: true,
        },
        timestamp: vaultV1.timestamp,
        version: 4,
      });
    });
  });

  /*****************************************************************/
  /***************************** CASE 5 ****************************/
  /*****************************************************************/

  /*
   * Description
   * A user is connected on the Vault App and on the Minting App.
   * The connected owner of the Minting App is in the Vault App Vault
   *
   * Expected behavior
   * Should import VaultV1 in VaultV2 and VaultV2 in VaultV1 using same connected owner
   */

  describe("case 5", () => {
    beforeAll(async () => {
      init();

      // Setup VaultV1
      await vaultClientV1.create();
      await vaultClientV1.addOwner(owner1);
      await vaultClientV1.importAccount(account2);
      await vaultClientV1.importAccount(account3);

      // Setup VaultV2
      let vault = await vaultClientV2.create();
      await vaultClientV2.addOwner(owner1);
      await vaultClientV2.importAccount(account1);
      await vaultClientV2.importAccount(account2);
      github1.wallet.mnemonic = vault.mnemonics[0];
      await vaultClientV2.importAccount(github1);

      vaultClientV1.lock();
      vaultClientV2.lock();
    });

    it("Should import VaultV1 in VaultV2 and VaultV2 in VaultV1 using same connected owner", async () => {
      const { owner } = await vaultSynchronizer.sync(owner1, owner1);

      vaultClientV1.lock();
      vaultClientV2.lock();
      const vaultV1 = await vaultClientV1.unlock(owner.seed);
      const vaultV2 = await vaultClientV2.unlock(owner.seed);

      github1.wallet = vaultV1.importedAccounts[3].wallet;
      github1.seed = vaultV1.importedAccounts[3].seed;

      expect(isVaultsSync(vaultV1, vaultV2)).toEqual(true);
      expect(vaultV1).toEqual({
        mnemonics: vaultV1.mnemonics,
        importedAccounts: [account2, account3, account1, github1],
        recoveryKeys: [],
        owners: [owner1],
        settings: {
          name: "My Sismo Vault",
          autoImportOwners: true,
          keepConnected: true,
        },
        timestamp: vaultV1.timestamp,
        version: 4,
      });
    });
  });

  /*****************************************************************/
  /***************************** CASE 6 ****************************/
  /*****************************************************************/

  /*
   * Description
   * A user is connected on the Vault App and on the Minting App.
   * The connected owner of the Minting App is not in the Vault App Vault
   *
   * Expected behavior
   * Should merge VaultV1 A and B and import VaultV1 in VaultV2 / VaultV2 in VaultV1
   */

  describe("case 6", () => {
    beforeAll(async () => {
      init();

      // Setup VaultV1 A
      let vault = await vaultClientV1.create();
      await vaultClientV1.addOwner(owner1);
      await vaultClientV1.importAccount(account1);
      await vaultClientV1.importAccount(account2);
      github1.wallet.mnemonic = vault.mnemonics[0];
      await vaultClientV1.importAccount(github1);
      vault = await vaultClientV1.generateRecoveryKey("Recovery 1");
      recoveryKey1 = vault.recoveryKeys[0];
      vaultClientV1.lock();

      // Setup VaultV1 B
      await vaultClientV1.create();
      await vaultClientV1.addOwner(owner3);
      await vaultClientV1.importAccount(account4);
      vault = await vaultClientV1.generateRecoveryKey("Recovery 2");
      recoveryKey2 = vault.recoveryKeys[0];

      // Setup VaultV2
      await vaultClientV2.create();
      await vaultClientV2.addOwner(owner2);
      await vaultClientV2.addOwner(owner3);
      await vaultClientV2.importAccount(account2);
      await vaultClientV2.importAccount(account3);
      vault = await vaultClientV2.generateRecoveryKey("Recovery 3");
      recoveryKey3 = vault.recoveryKeys[0];

      vaultClientV1.lock();
      vaultClientV2.lock();
    });

    it("Should merge VaultV1 A and B and import VaultV1 in VaultV2 / VaultV2 in VaultV1", async () => {
      const { owner } = await vaultSynchronizer.sync(owner1, owner2);

      vaultClientV1.lock();
      vaultClientV2.lock();

      const vaultV1 = await vaultClientV1.unlock(owner.seed);
      const vaultV2 = await vaultClientV2.unlock(owner.seed);

      github1.wallet = vaultV1.importedAccounts[2].wallet;
      github1.seed = vaultV1.importedAccounts[2].seed;

      expect(isVaultsSync(vaultV1, vaultV2)).toEqual(true);
      expect(vaultV1).toEqual({
        mnemonics: vaultV1.mnemonics,
        importedAccounts: [account1, account2, github1, account3, account4],
        recoveryKeys: [recoveryKey1, recoveryKey2, recoveryKey3],
        owners: [owner1, owner3, owner2],
        settings: {
          name: "My Sismo Vault",
          autoImportOwners: true,
          keepConnected: true,
        },
        timestamp: vaultV1.timestamp,
        version: 4,
      });
    });
  });
});

/*****************************************************************/
/***************************** UTILS *****************************/
/*****************************************************************/

const isVaultsSync = (vault1: Vault, vault2: Vault) => {
  // Imported accounts
  if (vault1.importedAccounts.length !== vault2.importedAccounts.length)
    return false;
  for (let account of vault1.importedAccounts) {
    if (!isAccountInVault(account.identifier, vault2)) return false;
  }
  // Owners
  if (vault1.owners.length !== vault2.owners.length) return false;
  for (let owner of vault1.owners) {
    if (!isOwnerInVault(owner.identifier, vault2)) return false;
  }
  // RecoveryKeys
  if (vault1.recoveryKeys.length !== vault2.recoveryKeys.length) return false;
  for (let recoveryKey of vault1.recoveryKeys) {
    if (!isRecoveryKeyInVault(recoveryKey.key, vault2)) return false;
  }
  return true;
};
