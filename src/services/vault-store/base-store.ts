export abstract class BaseStore {
  abstract get(id: string): Promise<string>;
  abstract post(cipherText: string, token: string, version: number): Promise<void>;
}
