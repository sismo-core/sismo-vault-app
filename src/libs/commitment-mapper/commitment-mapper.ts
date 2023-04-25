import { buildPoseidon, EddsaSignature } from "@sismo-core/crypto";
import { SNARK_FIELD } from "@sismo-core/hydra-s2";
import axios from "axios";
import { BigNumber } from "ethers";
import SHA3 from "sha3";
import {
  CommitmentMapperPubKey,
  CommitmentReceipt,
} from "../sismo-client/contracts/commons";

export type CommitmentMapperEthereumReturn = {
  commitmentMapperPubKey: CommitmentMapperPubKey;
  commitmentReceipt: CommitmentReceipt;
};
export type CommitmentMapperGithubReturn = {
  commitmentMapperPubKey: CommitmentMapperPubKey;
  commitmentReceipt: CommitmentReceipt;
  account: {
    login: string;
    profileId: number;
    name: string;
    avatarUrl: string;
    identifier: string;
  };
};

export type CommitmentMapperTwitterReturn = {
  commitmentMapperPubKey: CommitmentMapperPubKey;
  commitmentReceipt: CommitmentReceipt;
  account: {
    userId: number;
    username: string;
    identifier: string;
  };
};

export class CommitmentMapper {
  private url: string;

  constructor({ url }: { url?: string }) {
    if (url) this.url = url;
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

  public async migrateEddsa({
    receipt,
    identifier,
    vaultSecret,
    accountSecret,
  }: {
    receipt: EddsaSignature;
    identifier: string;
    vaultSecret: string;
    accountSecret: string;
  }): Promise<CommitmentMapperEthereumReturn> {
    const poseidon = await buildPoseidon();

    const oldCommitment = poseidon([accountSecret]).toHexString();
    const newCommitment = poseidon([vaultSecret, accountSecret]).toHexString();

    const { data } = await axios.post(`${this.url}/migrate-eddsa`, {
      receipt,
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

  public async getEthereumCommitmentReceipt(
    ethAddress: string,
    ethSignature: string,
    accountSecret: string,
    vaultSecret: string
  ): Promise<CommitmentMapperEthereumReturn> {
    const poseidon = await buildPoseidon();

    const commitment = poseidon([vaultSecret, accountSecret]).toHexString();

    const { data } = await axios.post(`${this.url}/commit-ethereum-eddsa`, {
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

  public async getGithubCommitmentReceipt(
    githubCode: string,
    accountSecret: string,
    vaultSecret: string
  ): Promise<CommitmentMapperGithubReturn> {
    const poseidon = await buildPoseidon();
    const commitment = poseidon([vaultSecret, accountSecret]).toHexString();

    const { data } = await axios.post(`${this.url}/commit-github-eddsa`, {
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

  public async getTwitterCommitmentReceipt(
    twitterOauthToken: string,
    twitterOauthVerifier: string,
    accountSecret: string,
    vaultSecret: string
  ): Promise<CommitmentMapperTwitterReturn> {
    const poseidon = await buildPoseidon();
    const commitment = poseidon([vaultSecret, accountSecret]).toHexString();

    const { data } = await axios.post(`${this.url}/commit-twitter-eddsa`, {
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
}
