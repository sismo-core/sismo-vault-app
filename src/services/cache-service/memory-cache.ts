import { Cache } from "./cache";

export class MemoryCache extends Cache {
  private cache: Map<string, any>;

  constructor() {
    super();
    this.cache = new Map();
  }

  public async get(key: string): Promise<any> {
    return this.cache.get(key);
  }

  public async set(key: string, value: any): Promise<void> {
    this.cache.set(key, value);
  }
}
