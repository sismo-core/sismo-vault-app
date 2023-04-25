import {
  ImportedAccount,
  Owner,
  VaultClient as VaultV1Client,
} from "../vault-client-v1";
import {
  CommitmentMapper,
  VaultClient as VaultV2Client,
} from "../vault-client-v2";
import { isAccountInVault } from "./utils/isAccountInVault";
import { isOwnerInVault } from "./utils/isOwnerInVault";
import { isRecoveryKeyInVault } from "./utils/isRecoveryKeyInVault";

type VaultsSynchronizerParams = {
  commitmentMapper: CommitmentMapper;
  vaultV1Client: VaultV1Client;
  vaultV2Client: VaultV2Client;
};

export class VaultsSynchronizer {
  private _commitmentMapper: CommitmentMapper;
  private _vaultV1Client: VaultV1Client;
  private _vaultV2Client: VaultV2Client;

  constructor({
    commitmentMapper,
    vaultV1Client,
    vaultV2Client,
  }: VaultsSynchronizerParams) {
    this._commitmentMapper = commitmentMapper;
    this._vaultV1Client = vaultV1Client;
    this._vaultV2Client = vaultV2Client;
  }

  // Return a owner which is in the VaultV1 and in the VaultV2
  public async sync(connectedOwnerV1: Owner, connectedOwnerV2: Owner) {
    if (!connectedOwnerV1 && !connectedOwnerV2) return null;

    const vaultV1Unlocked =
      connectedOwnerV1 &&
      (await this._vaultV1Client.unlock(connectedOwnerV1.seed));
    const vaultV2Unlocked =
      connectedOwnerV2 &&
      (await this._vaultV2Client.unlock(connectedOwnerV2.seed));

    if (vaultV1Unlocked && vaultV2Unlocked) {
      // We don't need to import V2 in V1 because every time we update V2 we update V1
      // + We reset all VaultV2 before sending in prod VaultsSynchronizer

      // Which mean a user cannot have imported an account in a VaultV2 which is not in the VaultV1
      // The only possibility is that a user have imported an account in a VaultV1 which is not in the VaultV2
      // because the user has imported an account in the minting app

      // If a user has imported an account in the minting app, we need to import it in the VaultV2
      if (isOwnerInVault(connectedOwnerV1.identifier, vaultV2Unlocked)) {
        await this._importV1toV2();
      } else {
        // TODO: Create a static function to get a vault in order to avoid unlocking a vault
        const vaultV2 = await this._vaultV2Client.unlock(connectedOwnerV1.seed);
        if (!vaultV2) {
          // If the connectedOwnerV1 is not in another VaultV2
          await this._vaultV2Client.unlock(connectedOwnerV2.seed);
          await this._importV1toV2();
        } else {
          // If the connectedOwnerV1 is in another VaultV2
          // Edge case to discuss
        }
      }
    }

    if (vaultV1Unlocked && !vaultV2Unlocked) {
      // If we are not connected on the Vault App but we are connected on the Minting App:
      const vaultV2 = await this._vaultV2Client.unlock(connectedOwnerV1.seed);
      if (!vaultV2) {
        this._vaultV2Client.create();
      }
      await this._importV1toV2();

      // We import the VaultV1 of the connectedOwnerV1 in the VaultV2 controlled by the connectedOwnerV1
      // To access to the VaultV2 we then need to connect the Vault App on the connectedOwnerV1
      connectedOwnerV2 = connectedOwnerV1;
    }

    return connectedOwnerV2;
  }

  private _importV1toV2 = async () => {
    const [vaultV1, vaultV2] = await Promise.all([
      this._vaultV1Client.load(),
      this._vaultV2Client.load(),
    ]);
    let vaultSecret = null;

    for (let account of vaultV1.importedAccounts) {
      if (isAccountInVault(account.identifier, vaultV2)) continue;

      try {
        // Throw an error if the account is already imported in another VaultV2
        if (!vaultSecret)
          vaultSecret = await this._vaultV2Client.getVaultSecret();
        const { commitmentReceipt, commitmentMapperPubKey } =
          await this._commitmentMapper.migrateEddsa({
            receipt: account.commitmentReceipt,
            identifier: account.identifier,
            vaultSecret,
            accountSecret: CommitmentMapper.generateCommitmentMapperSecret(
              account.seed
            ),
          });
        const importedAccount: ImportedAccount = {
          ...account,
          commitmentReceipt,
          commitmentMapperPubKey,
        };
        await this._vaultV2Client.importAccount(importedAccount);
      } catch (e) {}
    }

    for (let owner of vaultV1.owners) {
      if (isOwnerInVault(owner.identifier, vaultV2)) continue;

      try {
        // Throw an error if the owner is already imported in another VaultV2
        await this._vaultV2Client.addOwner(owner);
      } catch (e) {}
    }

    for (let recoveryKey of vaultV1.recoveryKeys) {
      if (isRecoveryKeyInVault(recoveryKey.key, vaultV2)) continue;

      try {
        // Throw an error if the recoveryKey is already imported in another VaultV2
        await this._vaultV2Client.addRecoveryKey(recoveryKey);
      } catch (e) {}
    }
  };
}
