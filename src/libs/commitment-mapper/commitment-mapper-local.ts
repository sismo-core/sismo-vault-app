import { EddsaSignature } from "@sismo-core/crypto";
import {
  CommitmentMapper,
  CommitmentReceiptGithubResult,
  CommitmentReceiptResult,
  CommitmentReceiptTwitterResult,
} from "./commitment-mapper";

export class CommitmentMapperLocal extends CommitmentMapper {
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
      commitmentMapperPubKey: null,
      commitmentReceipt: null,
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
      commitmentMapperPubKey: null,
      commitmentReceipt: null,
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
      commitmentMapperPubKey: null,
      commitmentReceipt: null,
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
    receipt: EddsaSignature;
    identifier: string;
    oldCommitment: string;
    newCommitment: string;
  }): Promise<CommitmentReceiptResult> {
    return {
      commitmentMapperPubKey: null,
      commitmentReceipt: null,
    };
  }
}
