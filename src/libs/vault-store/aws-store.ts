import axios from "axios";
import { BaseStore } from "./base-store";

export class AWSStore extends BaseStore {
  private vaultUrl: string;

  constructor({ vaultUrl }: { vaultUrl: string }) {
    super();
    if (vaultUrl) this.vaultUrl = vaultUrl;
  }

  public async get(id: string): Promise<string | null> {
    try {
      const { data } = await axios.get(
        `${this.vaultUrl}/retrieve?id=${id}&cache_id=${Date.now()}`
      );
      return data.ciphertext;
    } catch (e) {
      console.error(e);
    }
    return null;
  }

  public async post(
    ciphertext: string,
    token: string,
    version: number
  ): Promise<void> {
    await axios.post(`${this.vaultUrl}/add`, {
      token,
      ciphertext,
      version,
    });
  }
}
