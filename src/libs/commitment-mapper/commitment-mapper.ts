import { SNARK_FIELD } from "@sismo-core/hydra-s2";
import { BigNumber } from "ethers";
import SHA3 from "sha3";
import { getPoseidon } from "../poseidon";
import env from "../../environment";
import { Profile } from "../vault-client";

export type CommitmentReceiptResult = {
  commitmentMapperPubKey: [string, string];
  commitmentReceipt: [string, string, string];
};

export type Web2ImpersonatedCommitmentResult = {
  identifier: string;
  profile: Profile;
} & CommitmentReceiptResult;

export type CommitmentReceiptGithubResult = {
  account: {
    profileId: number;
    login: string;
    name: string;
    avatarUrl: string;
    identifier: string;
  };
} & CommitmentReceiptResult;

export type CommitmentReceiptTelegramResult = {
  account: {
    identifier: string;
    firstName: string;
    lastName: string;
    userId: number;
    username: string;
    photoUrl: string;
    authDate: number;
    hash: string;
  };
} & CommitmentReceiptResult;

export type CommitmentReceiptTwitterResult = {
  account: {
    userId: number;
    username: string;
    identifier: string;
  };
} & CommitmentReceiptResult;

export abstract class CommitmentMapper {
  protected abstract _migrateEddsa({
    receipt,
    identifier,
    oldCommitment,
    newCommitment,
  }: {
    receipt: [string, string, string];
    identifier: string;
    oldCommitment: string;
    newCommitment: string;
  }): Promise<CommitmentReceiptResult>;
  protected abstract _commitEthereumEddsa({
    ethAddress,
    ethSignature,
    commitment,
  }: {
    ethAddress: string;
    ethSignature: string;
    commitment: string;
  }): Promise<CommitmentReceiptResult>;
  protected abstract _commitGithubEddsa({
    githubCode,
    commitment,
  }: {
    githubCode: string;
    commitment: string;
  }): Promise<CommitmentReceiptGithubResult>;
  protected abstract _commitTelegramEddsa({
    botId,
    payload,
    commitment,
  }: {
    botId: string;
    payload: string;
    commitment: string;
  }): Promise<CommitmentReceiptTelegramResult>;
  protected abstract _commitTwitterEddsa({
    twitterOauthToken,
    twitterOauthVerifier,
    commitment,
  }: {
    twitterOauthToken: string;
    twitterOauthVerifier: string;
    commitment: string;
  }): Promise<CommitmentReceiptTwitterResult>;
  protected abstract _commitTwitterV2Eddsa({
    callback,
    twitterCode,
    commitment,
  }: {
    callback: string;
    twitterCode: string;
    commitment: string;
  }): Promise<CommitmentReceiptTwitterResult>;

  public async getPubKey(): Promise<[string, string]> {
    return env.sismoDestination.commitmentMapperPubKey;
  }

  public async migrateEddsa({
    receipt,
    identifier,
    oldCommitmentSecret,
    newCommitmentSecret,
  }: {
    receipt: [string, string, string];
    identifier: string;
    oldCommitmentSecret: any;
    newCommitmentSecret: any;
  }): Promise<CommitmentReceiptResult> {
    const poseidon = await getPoseidon();

    //[oldAccountSecret]
    //[vaultSecret, newAccountSecret]
    const oldCommitment = poseidon(oldCommitmentSecret).toHexString();
    const newCommitment = poseidon(newCommitmentSecret).toHexString();

    return await this._migrateEddsa({
      receipt,
      identifier,
      oldCommitment,
      newCommitment,
    });
  }

  public async getEthereumCommitmentReceipt(
    ethAddress: string,
    ethSignature: string,
    accountSecret: string,
    vaultSecret: string
  ): Promise<CommitmentReceiptResult> {
    const poseidon = await getPoseidon();
    const commitment = poseidon([vaultSecret, accountSecret]).toHexString();
    return await this._commitEthereumEddsa({
      ethAddress,
      ethSignature,
      commitment,
    });
  }

  public async getGithubCommitmentReceipt(
    githubCode: string,
    accountSecret: string,
    vaultSecret: string
  ): Promise<CommitmentReceiptGithubResult> {
    const poseidon = await getPoseidon();
    const commitment = poseidon([vaultSecret, accountSecret]).toHexString();

    return await this._commitGithubEddsa({ githubCode, commitment });
  }

  public async getTelegramCommitmentReceipt(
    botId: string,
    payload: string,
    accountSecret: string,
    vaultSecret: string
  ): Promise<CommitmentReceiptTelegramResult> {
    const poseidon = await getPoseidon();
    const commitment = poseidon([vaultSecret, accountSecret]).toHexString();

    return await this._commitTelegramEddsa({ botId, payload, commitment });
  }

  public async getTwitterCommitmentReceipt(
    twitterOauthToken: string,
    twitterOauthVerifier: string,
    accountSecret: string,
    vaultSecret: string
  ): Promise<CommitmentReceiptTwitterResult> {
    const poseidon = await getPoseidon();
    const commitment = poseidon([vaultSecret, accountSecret]).toHexString();

    return await this._commitTwitterEddsa({
      twitterOauthToken,
      twitterOauthVerifier,
      commitment,
    });
  }

  public async getTwitterV2CommitmentReceipt(
    callback: string,
    twitterCode: string,
    accountSecret: string,
    vaultSecret: string
  ): Promise<CommitmentReceiptTwitterResult> {
    const poseidon = await getPoseidon();
    const commitment = poseidon([vaultSecret, accountSecret]).toHexString();

    return await this._commitTwitterV2Eddsa({
      callback,
      twitterCode,
      commitment,
    });
  }

  static generateCommitmentMapperSecret = (seed: string) => {
    const hash = new SHA3(256);
    return BigNumber.from(
      "0x" + hash.update(seed + "/commitmentMapperSecret").digest("hex")
    )
      .mod(SNARK_FIELD)
      .toHexString();
  };

  public getOwnershipMsg(identifier: string) {
    return `Sign this message to generate an offchain commitment.\nIt is used to perform necessary cryptographic computations when generating Sismo Attestations.\n\nWallet address:\n${identifier.toLowerCase()}\n\nIMPORTANT: Only sign this message if you are on Sismo application.\n`;
  }
}
