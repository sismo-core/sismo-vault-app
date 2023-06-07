import { IndexDbCache } from "../../cache-service/indexdb-cache";
import { ImportedAccount, Profile } from "../../vault-client";

export type Account = Pick<ImportedAccount, "profile">;

export abstract class ProfileApiResolver {
  protected abstract _cache: IndexDbCache;

  public async getProfile(identifier: string): Promise<Profile> {
    return await this._getProfile(identifier);
  }

  protected abstract _getProfile(identifier: string): Promise<Profile>;
}
