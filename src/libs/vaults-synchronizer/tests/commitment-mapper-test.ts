import {
  CommitmentMapper,
  CommitmentReceiptGithubResult,
  CommitmentReceiptResult,
  CommitmentReceiptTwitterResult,
} from "../../commitment-mapper";

export class CommitmentMapperTest extends CommitmentMapper {
  private _pubKey: [string, string];
  private _commitmentReceipt: [string, string, string];

  constructor(name: string) {
    super();
    this._pubKey = [name, name];
    this._commitmentReceipt = [name, name, name];
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
    return {
      commitmentMapperPubKey: this._pubKey,
      commitmentReceipt: this._commitmentReceipt,
    };
  }

  protected async _commitGithubEddsa({
    githubCode,
    commitment,
  }: {
    githubCode: string;
    commitment: string;
  }): Promise<CommitmentReceiptGithubResult> {
    return {
      commitmentMapperPubKey: this._pubKey,
      commitmentReceipt: this._commitmentReceipt,
      account: {
        profileId: null,
        login: null,
        name: null,
        avatarUrl: null,
        identifier: null,
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
    return {
      commitmentMapperPubKey: this._pubKey,
      commitmentReceipt: this._commitmentReceipt,
      account: {
        userId: null,
        username: null,
        identifier: null,
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
    if (receipt[0] !== oldCommitment) throw Error("Invalid receipt");
    return {
      commitmentMapperPubKey: this._pubKey,
      commitmentReceipt: [newCommitment, newCommitment, newCommitment],
    };
  }
}
