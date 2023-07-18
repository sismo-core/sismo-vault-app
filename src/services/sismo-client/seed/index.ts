import SHA3 from "sha3";

export class Seed {
  static generateSeed = (signature: string) => {
    const hash = new SHA3(256);
    return "0x" + hash.update(signature).digest("hex");
  };

  static getSeedMsg = (ethAddress: string) => {
    return `Sign this message to generate your Sismo seed.\nIt is used to perform necessary cryptographic computations when generating Sismo Attestations or encrypting your Vault.\n\nWallet address:\n${ethAddress.toLowerCase()}\n\nIMPORTANT: Only sign this message if you are on Sismo application.\n`;
  };
}
