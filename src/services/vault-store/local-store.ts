import { BaseStore } from "./base-store";
import SHA3 from "sha3";

export class LocalStore extends BaseStore {
  private mapper: Map<string, string>;

  constructor() {
    super();
    this.mapper = new Map();
  }

  public async get(id: string): Promise<string> {
    if (!this.mapper.has(id)) return null;
    return this.mapper.get(id);
  }

  public async post(cipherText: string, token: string, version: number): Promise<void> {
    const hash = new SHA3(256);
    const id = hash.update(token).digest("hex");
    this.mapper.set(id, cipherText);
  }
}
