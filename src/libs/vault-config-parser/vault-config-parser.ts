import { SismoConnectRequest } from "../sismo-client/sismo-connect-prover/sismo-connect-v1";

export type VaultConfig = Pick<SismoConnectRequest, "vault">;

export class VaultConfigParser {
  public get(): VaultConfig | null {
    return this._parseUrlParams();
  }

  private _parseUrlParams() {
    const searchParams = new URLSearchParams(window.location.search);

    if (!searchParams) {
      console.error("No search params found in url");
      return null;
    }
    let _vault = searchParams.get("vault");

    const request: VaultConfig = {
      vault: JSON.parse(_vault),
    };

    return request;
  }
}
