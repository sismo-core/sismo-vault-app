import { Wallet } from "ethers";
import SHA3 from "sha3";

const walletAccountsCache: {
  [mnemonicHash: string]: {
    [path: string]: {
      [accountNumber: number]: Wallet;
    };
  };
} = {};

export enum WalletPurpose {
  IMPORTED_ACCOUNT = 10,
  RECOVERY_KEY = 11,
}

export class SismoWallet {
  private mnemonic: string;
  private mnemonicHash: string;

  constructor(mnemonic: string) {
    const hash = new SHA3(256);
    this.mnemonic = mnemonic;
    this.mnemonicHash = hash.update(mnemonic + "cache").digest("hex");
  }

  static getPath = (purpose: WalletPurpose, accountNumber: number): string => {
    return `m/51'/${purpose}'/0'/0/${accountNumber}`;
  };

  static generateMnemonic(): string {
    const path = SismoWallet.getPath(WalletPurpose.IMPORTED_ACCOUNT, 0);
    const wallet = Wallet.createRandom({ path });
    return wallet.mnemonic.phrase;
  }

  private getWallet(purpose: WalletPurpose, accountNumber: number): Wallet {
    const path = SismoWallet.getPath(purpose, accountNumber);
    if (!walletAccountsCache[this.mnemonicHash])
      walletAccountsCache[this.mnemonicHash] = {};
    if (!walletAccountsCache[this.mnemonicHash][path])
      walletAccountsCache[this.mnemonicHash][path] = {};
    let wallet = null;
    if (walletAccountsCache[this.mnemonicHash][path][accountNumber]) {
      wallet = walletAccountsCache[this.mnemonicHash][path][accountNumber];
    } else {
      wallet = Wallet.fromMnemonic(this.mnemonic, path);
      walletAccountsCache[this.mnemonicHash][path][accountNumber] = wallet;
    }
    return wallet;
  }

  public getAccount(purpose: WalletPurpose, accountNumber: number): string {
    const wallet = this.getWallet(purpose, accountNumber);
    return wallet.address.toLowerCase();
  }

  public async sign(
    purpose: WalletPurpose,
    accountNumber: number,
    message: string
  ): Promise<string> {
    const wallet = this.getWallet(purpose, accountNumber);
    return await wallet.signMessage(message);
  }
}
