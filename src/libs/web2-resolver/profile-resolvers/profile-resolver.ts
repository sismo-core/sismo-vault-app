import { IndexDbCache } from "../../cache-service/indexdb-cache";
import { ImportedAccount } from "../../vault-client";

export type Account = Pick<ImportedAccount, "profile">;

export abstract class ProfileResolver {
  private _cache: IndexDbCache;

  constructor() {
    this._cache = new IndexDbCache();
  }

  public async getProfile(identifier: string): Promise<Account> {
    const cachedProfile = await this._cache.get(identifier);
    if (cachedProfile) {
      return cachedProfile;
    }

    const parsedProfileHandle = this._parseHandleFromWeb2(identifier);
    const profile = await this._getProfile(parsedProfileHandle);

    if (!profile) {
      throw new Error("Profile not found");
    }

    await this._cache.set(identifier, profile);
    return profile;
  }

  private _parseHandleFromWeb2(identifier): string {
    const profileHandle = identifier.split(":")[1];
    return profileHandle;
  }

  protected abstract _getProfile(identifier: string): Promise<Account>;
}
