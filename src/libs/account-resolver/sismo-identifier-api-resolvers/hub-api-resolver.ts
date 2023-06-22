import { SismoIdentifierApiResolver } from "./sismo-identifier-api-resolver";
import axios from "axios";
import { IndexDbCache } from "../../cache-service/indexdb-cache";

export class HubApiResolver extends SismoIdentifierApiResolver {
  private _apiUrl: string;
  protected _cache: IndexDbCache;

  constructor({ apiUrl }: { apiUrl: string }) {
    super();
    this._apiUrl = apiUrl;
    this._cache = new IndexDbCache();
  }

  protected async _getSismoIdentifier(identifier: string): Promise<string> {
    const cachedProfile = await this._cache.get(`${identifier}`);
    if (cachedProfile) {
      return cachedProfile;
    }
    const res = await axios.post(`${this._apiUrl}/resolver`, [identifier]);
    const sismoIdentifier = res.data[0] as string;
    await this._cache.set(`${identifier}`, sismoIdentifier);
    return sismoIdentifier;
  }
}
