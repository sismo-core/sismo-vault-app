import { CommitmentMapper } from "../commitment-mapper";
import {
  ImportedAccount,
  Owner,
  Vault,
  VaultClient as VaultClientV1,
  WalletPurpose,
} from "../vault-client-v1";
import { VaultClient as VaultClientV2 } from "../vault-client-v2";
import { getExistingVaultSeed } from "./utils/getVaultSeed";
import { isAccountInVault } from "./utils/isAccountInVault";
import { isOwnerInVault } from "./utils/isOwnerInVault";
import { isRecoveryKeyInVault } from "./utils/isRecoveryKeyInVault";

type VaultsSynchronizerParams = {
  commitmentMapperV2: CommitmentMapper;
  commitmentMapperV1: CommitmentMapper;
  vaultClientV1: VaultClientV1;
  vaultClientV2: VaultClientV2;
};

export class VaultsSynchronizer {
  private _commitmentMapperV1: CommitmentMapper;
  private _commitmentMapperV2: CommitmentMapper;
  private _vaultClientV1: VaultClientV1;
  private _vaultClientV2: VaultClientV2;

  constructor({
    commitmentMapperV1,
    commitmentMapperV2,
    vaultClientV1,
    vaultClientV2,
  }: VaultsSynchronizerParams) {
    this._commitmentMapperV1 = commitmentMapperV1;
    this._commitmentMapperV2 = commitmentMapperV2;
    this._vaultClientV1 = vaultClientV1;
    this._vaultClientV2 = vaultClientV2;
  }

  /*
   * return a owner which is in the VaultV1 and in the VaultV2
   */
  public async sync(
    connectedOwnerV1: Owner,
    connectedOwnerV2: Owner
  ): Promise<{ owner: Owner; vault: Vault }> {
    if (!connectedOwnerV1 && !connectedOwnerV2) return null;

    this._vaultClientV2.lock();
    this._vaultClientV1.lock();

    let [vaultV1, vaultV2] = await Promise.all([
      connectedOwnerV1 &&
        (await this._vaultClientV1.unlock(connectedOwnerV1.seed)),
      connectedOwnerV2 &&
        (await this._vaultClientV2.unlock(connectedOwnerV2.seed)),
    ]);

    // Tested by case 1, 2
    // This work well when the user has only one VaultV2
    // But not when the user has multiple vaultV2
    if (vaultV1 && !vaultV2) {
      // 1. We unlock or create a VaultV2
      // If a VaultV2 exist using a seed of VaultV1
      const seedV2 = await getExistingVaultSeed(vaultV1, this._vaultClientV2);

      // If we have a seed in the VaultV1 which already controlled a VaultV2
      // we unlock this VaultV2 else we create a new one
      if (seedV2) {
        // Tested by case 2
        vaultV2 = await this._vaultClientV2.unlock(seedV2);
      } else {
        // Tested by case 1
        vaultV2 = this._vaultClientV2.create();
      }

      // 2. We import the VaultV1 in the unlocked VaultV2 and VaultV2 in VaultV1
      vaultV1 = await this._importV2toV1(vaultV2, vaultV1);
      // Import V1 to V2 in second to import all merged vaults in VaultV2
      vaultV2 = await this._importV1toV2(vaultV1, vaultV2);

      // 3. The connected VaultV2 is identical to VaultV1, we use the connectedOwner of the vaultV1 to keep the connection
      return {
        owner: connectedOwnerV1,
        vault: vaultV2,
      };
    }

    // Tested by case 3, 4
    if (!vaultV1 && vaultV2) {
      // 1. We unlock or create a VaultV1
      // If a VaultV1 exist using a seed of VaultV2
      const seedV1 = await getExistingVaultSeed(vaultV2, this._vaultClientV1);
      if (seedV1) {
        // Tested case 4
        vaultV1 = await this._vaultClientV1.unlock(seedV1);
      } else {
        // Tested case 3
        vaultV1 = this._vaultClientV1.create();
      }

      // 2. We import the VaultV1 in the unlocked VaultV2 and VaultV2 in VaultV1
      vaultV1 = await this._importV2toV1(vaultV2, vaultV1);
      vaultV2 = await this._importV1toV2(vaultV1, vaultV2);

      return {
        owner: connectedOwnerV2,
        vault: vaultV2,
      };
    }

    // Tested by case 5, 6
    // This work well when the user has only one VaultV2
    // But not when the user has multiple vaultV2
    if (vaultV1 && vaultV2) {
      vaultV1 = await this._importV2toV1(vaultV2, vaultV1);
      vaultV2 = await this._importV1toV2(vaultV1, vaultV2);

      return {
        owner: connectedOwnerV2,
        vault: vaultV2,
      };
    }
  }

  /*****************************************************************/
  /*************************** V1 to V2 ****************************/
  /*****************************************************************/

  private _importV1toV2 = async (
    vaultV1: Vault,
    vaultV2: Vault
  ): Promise<Vault> => {
    let vaultSecret = null;

    for (let account of vaultV1.importedAccounts) {
      if (isAccountInVault(account.identifier, vaultV2)) continue;

      try {
        // Throw an error if the account is already imported in another VaultV2
        if (!vaultSecret)
          vaultSecret = await this._vaultClientV2.getVaultSecret();

        vaultV2 = await this._migrateAccountS1toS2(account, vaultSecret);
      } catch (e) {
        console.log(e);
      }
    }

    for (let owner of vaultV1.owners) {
      if (isOwnerInVault(owner.identifier, vaultV2)) continue;

      try {
        // Throw an error if the owner is already imported in another VaultV2
        vaultV2 = await this._vaultClientV2.addOwner(owner);
      } catch (e) {
        console.log(e);
      }
    }

    for (let recoveryKey of vaultV1.recoveryKeys) {
      if (isRecoveryKeyInVault(recoveryKey.key, vaultV2)) continue;

      try {
        // Throw an error if the recoveryKey is already imported in another VaultV2
        vaultV2 = await this._vaultClientV2.addRecoveryKey(recoveryKey);
      } catch (e) {
        console.log(e);
      }
    }

    return vaultV2;
  };

  private _migrateAccountS1toS2 = async (
    account: ImportedAccount,
    vaultSecret: string
  ) => {
    const oldAccountSecret = CommitmentMapper.generateCommitmentMapperSecret(
      account.seed
    );

    let newAccountSecret;
    if (account.type !== "ethereum") {
      // If it's a web2 account we update the seed with the mnemonic of the VaultV1
      const { seed, accountNumber, mnemonic } =
        await this._vaultClientV2.getNextSeed(WalletPurpose.IMPORTED_ACCOUNT);
      account.wallet = {
        mnemonic: mnemonic,
        accountNumber: accountNumber,
      };
      account.seed = seed;
    }
    newAccountSecret = CommitmentMapper.generateCommitmentMapperSecret(
      account.seed
    );

    const oldCommitmentSecret = [oldAccountSecret];
    const newCommitmentSecret = [vaultSecret, newAccountSecret];

    const { commitmentReceipt, commitmentMapperPubKey } =
      await this._commitmentMapperV2.migrateEddsa({
        receipt: account.commitmentReceipt,
        identifier: account.identifier,
        vaultSecret,
        oldCommitmentSecret,
        newCommitmentSecret,
      });

    const importedAccount: ImportedAccount = {
      ...account,
      commitmentReceipt,
      commitmentMapperPubKey,
    };

    return await this._vaultClientV2.importAccount(importedAccount);
  };

  /*****************************************************************/
  /*************************** V2 to V1 ****************************/
  /*****************************************************************/

  private _importV2toV1 = async (
    vaultV2: Vault,
    vaultV1: Vault
  ): Promise<Vault> => {
    let vaultSecret = null;
    for (let account of vaultV2.importedAccounts) {
      if (isAccountInVault(account.identifier, vaultV1)) continue;

      try {
        if (!vaultSecret)
          vaultSecret = await this._vaultClientV2.getVaultSecret();

        vaultV1 = await this._migrateAccountS2toS1(account, vaultSecret);
      } catch (e) {
        console.log(e);
      }
    }

    for (let owner of vaultV2.owners) {
      if (isOwnerInVault(owner.identifier, vaultV1)) continue;

      try {
        // Throw an error if the owner is already imported in another VaultV2
        vaultV1 = await this._vaultClientV1.addOwner(owner);
      } catch (e) {
        console.log(e);
      }
    }

    for (let recoveryKey of vaultV2.recoveryKeys) {
      if (isRecoveryKeyInVault(recoveryKey.key, vaultV1)) continue;

      try {
        // Throw an error if the recoveryKey is already imported in another VaultV2
        vaultV1 = await this._vaultClientV1.addRecoveryKey(recoveryKey);
      } catch (e) {
        console.log(e);
      }
    }

    return vaultV1;
  };

  private _migrateAccountS2toS1 = async (
    account: ImportedAccount,
    vaultSecret: string
  ) => {
    const oldAccountSecret = CommitmentMapper.generateCommitmentMapperSecret(
      account.seed
    );

    let newAccountSecret;
    if (account.type !== "ethereum") {
      // If it's a web2 account we update the seed with the mnemonic of the VaultV2
      const { seed, accountNumber, mnemonic } =
        await this._vaultClientV1.getNextSeed(WalletPurpose.IMPORTED_ACCOUNT);
      account.wallet = {
        mnemonic: mnemonic,
        accountNumber: accountNumber,
      };
      account.seed = seed;
    }
    newAccountSecret = CommitmentMapper.generateCommitmentMapperSecret(
      account.seed
    );

    const oldCommitmentSecret = [vaultSecret, oldAccountSecret];
    const newCommitmentSecret = [newAccountSecret];

    const { commitmentReceipt, commitmentMapperPubKey } =
      await this._commitmentMapperV1.migrateEddsa({
        receipt: account.commitmentReceipt,
        identifier: account.identifier,
        vaultSecret,
        oldCommitmentSecret,
        newCommitmentSecret,
      });

    const importedAccount: ImportedAccount = {
      ...account,
      commitmentReceipt,
      commitmentMapperPubKey,
    };

    return await this._vaultClientV1.importAccount(importedAccount);
  };
}
