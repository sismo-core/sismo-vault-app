import { SismoWallet, WalletPurpose } from ".";
import { utils } from "ethers";

describe("Vault client V1", () => {
  let mnemonic: string;
  let message: string;
  let sismoWallet: SismoWallet;

  beforeAll(() => {
    message = "Sign this message to prove your ownership";
    mnemonic = "truck afraid crane nasty elite present cushion evoke book dinosaur card lizard";
    sismoWallet = new SismoWallet(mnemonic);
  });

  it("Should get account 0", async () => {
    const account0 = sismoWallet.getAccount(WalletPurpose.IMPORTED_ACCOUNT, 0);
    expect(account0).toEqual("0xcc00cb1b69e4cab227cf2f07932b9d4fd5f56f0b");
  });

  it("Should get account 1", async () => {
    const account1 = sismoWallet.getAccount(WalletPurpose.IMPORTED_ACCOUNT, 1);
    expect(account1).toEqual("0xdd071ad6198a6930c38ff9105daf392d5cef52be");
  });

  it("Should get account 2", async () => {
    const account2 = sismoWallet.getAccount(WalletPurpose.IMPORTED_ACCOUNT, 2);
    expect(account2).toEqual("0x8715b65eb5014af2ea3387c75bd168ae53bb7ec7");
  });

  it("Should sign a message with account 0", async () => {
    const signature0 = await sismoWallet.sign(WalletPurpose.IMPORTED_ACCOUNT, 0, message);
    const address0 = utils.verifyMessage(message, signature0);
    expect(address0.toLowerCase()).toEqual(
      sismoWallet.getAccount(WalletPurpose.IMPORTED_ACCOUNT, 0)
    );
  });

  it("Should sign a message with account 1", async () => {
    const signature1 = await sismoWallet.sign(WalletPurpose.IMPORTED_ACCOUNT, 1, message);
    const address1 = utils.verifyMessage(message, signature1);
    expect(address1.toLowerCase()).toEqual(
      sismoWallet.getAccount(WalletPurpose.IMPORTED_ACCOUNT, 1)
    );
  });

  it("Should sign a message with account 2", async () => {
    const signature2 = await sismoWallet.sign(WalletPurpose.IMPORTED_ACCOUNT, 2, message);
    const address2 = utils.verifyMessage(message, signature2);
    expect(address2.toLowerCase()).toEqual(
      sismoWallet.getAccount(WalletPurpose.IMPORTED_ACCOUNT, 2)
    );
  });

  it("Should generate a new mnemonic and sign with it", async () => {
    const mnemonic = await SismoWallet.generateMnemonic();
    const wallet = new SismoWallet(mnemonic);
    const address = wallet.getAccount(WalletPurpose.IMPORTED_ACCOUNT, 0);
    const signature = await wallet.sign(WalletPurpose.IMPORTED_ACCOUNT, 0, message);
    const addressResolve = utils.verifyMessage(message, signature);
    expect(addressResolve.toLowerCase()).toEqual(address);
  });
});
