import axios from "axios";
import {
  CommitmentMapper,
  CommitmentReceiptGithubResult,
  CommitmentReceiptResult,
  CommitmentReceiptTelegramResult,
  CommitmentReceiptTwitterResult,
} from "./commitment-mapper";

export class CommitmentMapperAWS extends CommitmentMapper {
  private _url: string;

  constructor({ url }: { url: string }) {
    super();
    this._url = url;
  }

  protected async _commitEthereumEddsa({
    ethAddress,
    ethSignature,
    commitment,
  }: {
    ethAddress: string;
    ethSignature: string;
    commitment: string;
  }): Promise<CommitmentReceiptResult> {
    const { data } = await axios.post(`${this._url}/commit-ethereum-eddsa`, {
      ethAddress,
      ethSignature,
      commitment,
    });

    return {
      commitmentMapperPubKey: [
        data.commitmentMapperPubKey[0],
        data.commitmentMapperPubKey[1],
      ],
      commitmentReceipt: [
        data.commitmentReceipt[0],
        data.commitmentReceipt[1],
        data.commitmentReceipt[2],
      ],
    };
  }

  protected async _commitGithubEddsa({
    githubCode,
    commitment,
  }: {
    githubCode: string;
    commitment: string;
  }): Promise<CommitmentReceiptGithubResult> {
    const { data } = await axios.post(`${this._url}/commit-github-eddsa`, {
      githubCode,
      commitment,
    });

    return {
      commitmentMapperPubKey: [
        data.commitmentMapperPubKey[0],
        data.commitmentMapperPubKey[1],
      ],
      commitmentReceipt: [
        data.commitmentReceipt[0],
        data.commitmentReceipt[1],
        data.commitmentReceipt[2],
      ],
      account: {
        profileId: data.account.profileId,
        login: data.account.login,
        name: data.account.name,
        avatarUrl: data.account.avatarUrl,
        identifier: data.account.identifier,
      },
    };
  }

  protected async _commitTelegramEddsa({
    payload,
    commitment,
  }: {
    payload: string;
    commitment: string;
  }): Promise<CommitmentReceiptTelegramResult> {
    const { data } = await axios.post(`${this._url}/commit-telegram-eddsa`, {
      payload,
      commitment,
    });

    return {
      commitmentMapperPubKey: [
        data.commitmentMapperPubKey[0],
        data.commitmentMapperPubKey[1],
      ],
      commitmentReceipt: [
        data.commitmentReceipt[0],
        data.commitmentReceipt[1],
        data.commitmentReceipt[2],
      ],
      account: {
        id: data.account.id,
        first_name: data.account.first_name,
        last_name: data.account.last_name,
        username: data.account.username,
        photo_url: data.account.photo_url,
        auth_date: data.account.auth_date,
        hash: data.account.hash,
      },
    };
  }

  protected async _commitTwitterEddsa({
    twitterOauthToken,
    twitterOauthVerifier,
    commitment,
  }: {
    twitterOauthToken: string;
    twitterOauthVerifier: string;
    commitment: string;
  }): Promise<CommitmentReceiptTwitterResult> {
    const { data } = await axios.post(`${this._url}/commit-twitter-eddsa`, {
      oauthToken: twitterOauthToken,
      oauthVerifier: twitterOauthVerifier,
      commitment,
    });

    return {
      commitmentMapperPubKey: [
        data.commitmentMapperPubKey[0],
        data.commitmentMapperPubKey[1],
      ],
      commitmentReceipt: [
        data.commitmentReceipt[0],
        data.commitmentReceipt[1],
        data.commitmentReceipt[2],
      ],
      account: {
        userId: parseInt(data.account.userId),
        username: data.account.username,
        identifier: data.account.identifier,
      },
    };
  }

  protected async _commitTwitterV2Eddsa({
    callback,
    twitterCode,
    commitment,
  }: {
    callback: string;
    twitterCode: string;
    commitment: string;
  }): Promise<CommitmentReceiptTwitterResult> {
    const { data } = await axios.post(`${this._url}/commit-twitter-v2-eddsa`, {
      callback: callback,
      twitterCode: twitterCode,
      commitment,
    });

    return {
      commitmentMapperPubKey: [
        data.commitmentMapperPubKey[0],
        data.commitmentMapperPubKey[1],
      ],
      commitmentReceipt: [
        data.commitmentReceipt[0],
        data.commitmentReceipt[1],
        data.commitmentReceipt[2],
      ],
      account: {
        userId: parseInt(data.account.userId),
        username: data.account.username,
        identifier: data.account.identifier,
      },
    };
  }

  protected async _migrateEddsa({
    receipt,
    identifier,
    oldCommitment,
    newCommitment,
  }: {
    receipt: [string, string, string];
    identifier: string;
    oldCommitment: string;
    newCommitment: string;
  }): Promise<CommitmentReceiptResult> {
    const { data } = await axios.post(`${this._url}/migrate-eddsa`, {
      commitmentReceipt: receipt,
      identifier,
      oldCommitment,
      newCommitment,
    });

    return {
      commitmentMapperPubKey: [
        data.commitmentMapperPubKey[0],
        data.commitmentMapperPubKey[1],
      ],
      commitmentReceipt: [
        data.commitmentReceipt[0],
        data.commitmentReceipt[1],
        data.commitmentReceipt[2],
      ],
    };
  }
}
