import SHA3 from "sha3";
import CryptoJS from "crypto-js";
import { BaseStore } from "../../vault-store/base-store";

export class VaultProvider {
  private store: BaseStore;

  constructor({ store }: { store: BaseStore }) {
    this.store = store;
  }

  static getVaultToken(seed: string) {
    const hash = new SHA3(256);
    return "0x" + hash.update(seed + "/vault_v.1").digest("hex");
  }

  static getVaultEncryptionKey(seed: string) {
    const hash = new SHA3(256);
    return "0x" + hash.update(seed + "/vaultSecret").digest("hex");
  }

  public async get(seed: string): Promise<string | null> {
    const hash = new SHA3(256);
    const token = VaultProvider.getVaultToken(seed);
    const id = hash.update(token).digest("hex");
    try {
      const data = await this.store.get(id);
      if (!data) return null;
      const encryptionKey = VaultProvider.getVaultEncryptionKey(seed);
      var bytes = CryptoJS.AES.decrypt(data, encryptionKey);
      const vaultString = bytes.toString(CryptoJS.enc.Utf8);
      return vaultString;
    } catch (e) {
      if (e.response && e.response.status === 404) {
        return null;
      }
    }
  }

  public async post(seed: string, vault: string, version: number): Promise<void> {
    let ciphertext = null;
    const token = VaultProvider.getVaultToken(seed);
    if (vault) {
      const encryptionKey = VaultProvider.getVaultEncryptionKey(seed);
      ciphertext = CryptoJS.AES.encrypt(vault, encryptionKey).toString();
    }
    await this.store.post(ciphertext, token, version);
  }
}
