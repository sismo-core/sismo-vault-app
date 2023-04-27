import {
  CommitmentMapper,
  CommitmentReceiptGithubResult,
  CommitmentReceiptResult,
  CommitmentReceiptTwitterResult,
} from "./commitment-mapper";
import { commitmentMapperPubKeyDemo, commitmentReceiptDemo } from "./mocks";

export class CommitmentMapperDemo extends CommitmentMapper {
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
