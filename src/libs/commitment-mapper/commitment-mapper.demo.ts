import {
  CommitmentMapper,
  CommitmentMapperEthereumReturn,
  CommitmentMapperGithubReturn,
  CommitmentMapperTwitterReturn,
} from "./commitment-mapper";
import {
  commitmentMapperPubKeyDemo,
  commitmentReceiptDemo,
} from "./commitment-mapper.mock";

export class CommitmentMapperDemo extends CommitmentMapper {
  public async getEthereumCommitmentReceipt(
    ethAddress: string,
    ethSignature: string,
    accountSecret: string,
    vaultSecret: string
  ): Promise<CommitmentMapperEthereumReturn> {
    return {
      commitmentMapperPubKey: commitmentMapperPubKeyDemo,
      commitmentReceipt: commitmentReceiptDemo,
    };
  }

  public async getGithubCommitmentReceipt(
    githubCode: string,
    secret: string
  ): Promise<CommitmentMapperGithubReturn> {
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

  public async getTwitterCommitmentReceipt(
    twitterOauthToken: string,
    twitterOauthVerifier: string,
    secret: string
  ): Promise<CommitmentMapperTwitterReturn> {
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
}
