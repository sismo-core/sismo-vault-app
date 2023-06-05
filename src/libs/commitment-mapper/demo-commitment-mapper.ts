import {
  CommitmentMapper,
  CommitmentReceiptGithubResult,
  CommitmentReceiptResult,
  CommitmentReceiptTelegramResult,
  CommitmentReceiptTwitterResult,
} from "./commitment-mapper";
import { commitmentMapperPubKeyDemo, commitmentReceiptDemo } from "./mocks";

export class DemoCommitmentMapper extends CommitmentMapper {
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
      commitmentMapperPubKey: commitmentMapperPubKeyDemo,
      commitmentReceipt: commitmentReceiptDemo,
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
      commitmentMapperPubKey: commitmentMapperPubKeyDemo,
      commitmentReceipt: commitmentReceiptDemo,
      account: {
        profileId: 1234,
        login: "importedGithub",
        name: "data.account.name",
        avatarUrl: "",
        identifier: "1234",
      },
    };
  }

  protected async _commitTelegramEddsa({
    botId,
    payload,
    commitment,
  }: {
    botId: string;
    payload: string;
    commitment: string;
  }): Promise<CommitmentReceiptTelegramResult> {
    return {
      commitmentMapperPubKey: commitmentMapperPubKeyDemo,
      commitmentReceipt: commitmentReceiptDemo,
      account: {
        identifier: "identifier",
        firstName: "data.account.first_name",
        lastName: "data.account.last_name",
        userId: 1234,
        username: "data.account.username",
        photoUrl: "data.account.photo_url",
        authDate: 1234,
        hash: "data.account.hash",
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
      commitmentMapperPubKey: commitmentMapperPubKeyDemo,
      commitmentReceipt: commitmentReceiptDemo,
      account: {
        userId: 1234,
        username: "importedTwitter",
        identifier: "1234",
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
    return {
      commitmentMapperPubKey: commitmentMapperPubKeyDemo,
      commitmentReceipt: commitmentReceiptDemo,
      account: {
        userId: 1234,
        username: "importedTwitter",
        identifier: "1234",
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
    return {
      commitmentMapperPubKey: commitmentMapperPubKeyDemo,
      commitmentReceipt: commitmentReceiptDemo,
    };
  }
}
