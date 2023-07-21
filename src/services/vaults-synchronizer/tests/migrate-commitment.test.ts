import { VaultClient as VaultClientV1 } from "../../vault-client-v1";
import { ImportedAccount, VaultClient as VaultClientV2, WalletPurpose } from "../../vault-client";
import { LocalStore } from "../../vault-store/local-store";
import { CommitmentMapperTest } from "./commitment-mapper-test";
import { getS1Commitment, getS2Commitment } from "./utils/getCommitments";
import { VaultsSynchronizerTest } from "./vaults-synchronizer-test";

describe("Vaults Synchronizer migrate commitments", () => {
  let vaultSynchronizer: VaultsSynchronizerTest;
  let vaultClientV1: VaultClientV1;
  let vaultClientV2: VaultClientV2;
  let account1: ImportedAccount;
  let github1: ImportedAccount;
  let commitmentMapperV1: CommitmentMapperTest;
  let commitmentMapperV2: CommitmentMapperTest;
  let storeV1: LocalStore;
  let storeV2: LocalStore;

  const init = () => {
    commitmentMapperV1 = new CommitmentMapperTest("s1");
    commitmentMapperV2 = new CommitmentMapperTest("s2");

    storeV1 = new LocalStore();
    vaultClientV1 = new VaultClientV1(storeV1);

    storeV2 = new LocalStore();
    vaultClientV2 = new VaultClientV2(storeV2);

    vaultSynchronizer = new VaultsSynchronizerTest({
      commitmentMapperV1,
      commitmentMapperV2,
      vaultClientV1,
      vaultClientV2,
    });
  };

  it("Should migrate an ethereum account from hydra-s1 to hydra-s2", async () => {
    init();
    vaultClientV2.create();
    account1 = {
      identifier: "0x1111",
      seed: "0x11111",
      commitmentReceipt: ["s1", "s1", "s1"],
      commitmentMapperPubKey: ["s1", "s1"],
      type: "ethereum",
      timestamp: 1666532889777,
    };
    const oldCommitment = await getS1Commitment(account1);
    account1.commitmentReceipt = [oldCommitment, oldCommitment, oldCommitment];

    const vaultSecret = await vaultClientV2.getVaultSecret();

    const vaultV2 = await vaultSynchronizer.migrateAccountS1toS2(
      vaultClientV2,
      account1,
      vaultSecret
    );

    const newCommitment = await getS2Commitment(account1, vaultSecret);

    expect(vaultV2.importedAccounts[0]).toEqual({
      identifier: "0x1111",
      seed: "0x11111",
      commitmentReceipt: [newCommitment, newCommitment, newCommitment],
      commitmentMapperPubKey: ["s2", "s2"],
      type: "ethereum",
      timestamp: 1666532889777,
    });
  });

  it("Should migrate an ethereum account from hydra-s2 to hydra-s1", async () => {
    init();
    vaultClientV1.create();
    account1 = {
      identifier: "0x1111",
      seed: "0x11111",
      commitmentReceipt: ["s2", "s2", "s2"],
      commitmentMapperPubKey: ["s2", "s2"],
      type: "ethereum",
      timestamp: 1666532889777,
    };

    const vaultSecret = "0x34555";
    const oldCommitment = await getS2Commitment(account1, vaultSecret);
    account1.commitmentReceipt = [oldCommitment, oldCommitment, oldCommitment];

    const vaultV1 = await vaultSynchronizer.migrateAccountS2toS1(
      vaultClientV1,
      account1,
      vaultSecret
    );

    const newCommitment = await getS1Commitment(account1);

    expect(vaultV1.importedAccounts[0]).toEqual({
      identifier: "0x1111",
      seed: "0x11111",
      commitmentReceipt: [newCommitment, newCommitment, newCommitment],
      commitmentMapperPubKey: ["s1", "s1"],
      type: "ethereum",
      timestamp: 1666532889777,
    });
  });

  it("Must migrate accounts that are not ethereum accounts from hydra-s1 to hydra-s2", async () => {
    init();
    vaultClientV2.create();
    github1 = {
      identifier: "0x2111",
      seed: "0x21111",
      commitmentReceipt: ["s1", "s1", "s1"],
      commitmentMapperPubKey: ["s1", "s1"],
      type: "github",
      timestamp: 1666532889777,
      profile: {
        login: "login",
        id: 123,
        name: "name",
        avatar: "avatar",
      },
      wallet: {
        mnemonic: "mnemonic s1",
        accountNumber: 0,
      },
    };

    const vaultSecret = await vaultClientV2.getVaultSecret();
    const oldCommitment = await getS1Commitment(github1);
    github1.commitmentReceipt = [oldCommitment, oldCommitment, oldCommitment];

    const { seed, mnemonic, accountNumber } = await vaultClientV2.getNextSeed(
      WalletPurpose.IMPORTED_ACCOUNT
    );
    const vaultV2 = await vaultSynchronizer.migrateAccountS1toS2(
      vaultClientV2,
      github1,
      vaultSecret
    );
    github1.seed = seed;
    const newCommitment = await getS2Commitment(github1, vaultSecret);

    expect(vaultV2.importedAccounts[0]).toEqual({
      identifier: "0x2111",
      seed: seed,
      commitmentReceipt: [newCommitment, newCommitment, newCommitment],
      commitmentMapperPubKey: ["s2", "s2"],
      type: "github",
      timestamp: 1666532889777,
      profile: {
        login: "login",
        id: 123,
        name: "name",
        avatar: "avatar",
      },
      wallet: {
        mnemonic: mnemonic,
        accountNumber: accountNumber,
      },
    });
  });

  it("Must migrate accounts that are not ethereum accounts from hydra-s2 to hydra-s1", async () => {
    init();
    vaultClientV1.create();
    github1 = {
      identifier: "0x2111",
      seed: "0x21111",
      commitmentReceipt: ["s2", "s2", "s2"],
      commitmentMapperPubKey: ["s2", "s2"],
      type: "github",
      timestamp: 1666532889777,
      profile: {
        login: "login",
        id: 123,
        name: "name",
        avatar: "avatar",
      },
      wallet: {
        mnemonic: "mnemonic s2",
        accountNumber: 0,
      },
    };

    const vaultSecret = "0x34555";
    const oldCommitment = await getS2Commitment(github1, vaultSecret);
    github1.commitmentReceipt = [oldCommitment, oldCommitment, oldCommitment];

    const { seed, mnemonic, accountNumber } = await vaultClientV1.getNextSeed(
      WalletPurpose.IMPORTED_ACCOUNT
    );
    const vaultV2 = await vaultSynchronizer.migrateAccountS2toS1(
      vaultClientV1,
      github1,
      vaultSecret
    );
    github1.seed = seed;
    const newCommitment = await getS1Commitment(github1);

    expect(vaultV2.importedAccounts[0]).toEqual({
      identifier: "0x2111",
      seed: seed,
      commitmentReceipt: [newCommitment, newCommitment, newCommitment],
      commitmentMapperPubKey: ["s1", "s1"],
      type: "github",
      timestamp: 1666532889777,
      profile: {
        login: "login",
        id: 123,
        name: "name",
        avatar: "avatar",
      },
      wallet: {
        mnemonic: mnemonic,
        accountNumber: accountNumber,
      },
    });
  });
});
