import { VaultClient as VaultClientV1 } from "../../vault-client-v1";
import {
  ImportedAccount,
  VaultClient as VaultClientV2,
} from "../../vault-client";
import { VaultsSynchronizer } from "../vaults-synchronizer";

export class VaultsSynchronizerTest extends VaultsSynchronizer {
  public migrateAccountS1toS2 = async (
    vaultClientV2: VaultClientV2,
    account: ImportedAccount,
    vaultSecret: string
  ) => {
    return this._migrateAccountS1toS2(vaultClientV2, account, vaultSecret);
  };

  public migrateAccountS2toS1 = async (
    vaultClientV1: VaultClientV1,
    account: ImportedAccount,
    vaultSecret: string
  ) => {
    return await this._migrateAccountS2toS1(
      vaultClientV1,
      account,
      vaultSecret
    );
  };
}
