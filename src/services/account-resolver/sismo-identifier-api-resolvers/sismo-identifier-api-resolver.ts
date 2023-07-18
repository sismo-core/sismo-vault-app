import { IndexDbCache } from "../../cache-service/indexdb-cache";

export abstract class SismoIdentifierApiResolver {
  protected abstract _cache: IndexDbCache;

  public async getSismoIdentifier(identifier: string): Promise<string> {
    return await this._getSismoIdentifier(identifier);
  }

  protected abstract _getSismoIdentifier(identifier: string): Promise<string>;
}
