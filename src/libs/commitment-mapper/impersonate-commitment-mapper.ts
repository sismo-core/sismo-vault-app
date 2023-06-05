import { EddsaAccount, SNARK_FIELD, buildPoseidon } from "@sismo-core/crypto";
import {
  CommitmentMapper,
  CommitmentReceiptGithubResult,
  CommitmentReceiptResult,
  CommitmentReceiptTwitterResult,
} from "./commitment-mapper";
import { BigNumber } from "ethers";
import { MemoryCache } from "../cache-service";

export type HashCommitmentReceiptAPIResponse = {
  commitmentMapperPubKey: [string, string];
  commitmentReceipt: [string, string, string];
};

export class ImpersonateCommitmentMapper extends CommitmentMapper {
  private _cache: MemoryCache;

  constructor() {
    super();
    this._cache = new MemoryCache();
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
    const { commitmentMapperPubKey, commitmentReceipt } =
      await this._getCommitmentReceipt(ethAddress, commitment);

    return {
      commitmentMapperPubKey,
      commitmentReceipt,
    };
  }

  protected async _commitGithubEddsa({
    githubCode,
    commitment,
  }: {
    githubCode: string;
    commitment: string;
  }): Promise<CommitmentReceiptGithubResult> {
    const { commitmentMapperPubKey, commitmentReceipt } =
      await this._getCommitmentReceipt(githubCode, commitment);

    return {
      commitmentMapperPubKey,
      commitmentReceipt,
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
    const { commitmentMapperPubKey, commitmentReceipt } =
      await this._constructCommitmentReceipt(twitterOauthToken, commitment);

    return {
      commitmentMapperPubKey,
      commitmentReceipt,
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
    // not implemented in impersonate mode

    return {
      commitmentMapperPubKey: null,
      commitmentReceipt: null,
    };
  }

  protected async _getCommitmentReceipt(
    ethAddress: string,
    commitment: string
  ): Promise<HashCommitmentReceiptAPIResponse> {
    // get the commitmentReceipt from the cache
    const cacheKey = `${ethAddress}-${commitment}`;
    const cachedCommitmentReceipt = await this._cache.get(cacheKey);

    if (cachedCommitmentReceipt) {
      return cachedCommitmentReceipt;
    }

    // if not in cache, construct the commitmentReceipt
    const commitmentReceipt = await this._constructCommitmentReceipt(
      ethAddress,
      commitment
    );

    // store the commitmentReceipt in the cache
    await this._cache.set(cacheKey, commitmentReceipt);

    return commitmentReceipt;
  }

  protected async _constructCommitmentReceipt(
    ethAddress: string,
    commitment: string
  ): Promise<HashCommitmentReceiptAPIResponse> {
    // instantiate the eddsaAccount of this commitmentMapper implementation
    // this will be used to sign the receipt
    const secret = {
      seed: "8f20413d064da1efcc4866807b7781473d2de56abc0e173b84ad437f59abbe15",
    };

    const eddsaAccount = await EddsaAccount.generateFromSeed(
      BigNumber.from(secret.seed)
    );

    // construct the receipt
    const poseidon = await buildPoseidon();
    const ethAddressBigNumber = BigNumber.from(ethAddress.toLowerCase()).mod(
      SNARK_FIELD
    );
    const msg = poseidon([ethAddressBigNumber, commitment]);
    // sign the receipt => this is the commitmentReceipt
    const commitmentReceipt = await eddsaAccount.sign(msg);

    // convert bigNumber receipt to HexString
    const commitmentReceiptHex = commitmentReceipt.map((receipt: BigNumber) =>
      receipt.toHexString()
    );
    const pubKeyHex = eddsaAccount
      .getPubKey()
      .map((coord: BigNumber) => coord.toHexString());

    return {
      commitmentMapperPubKey: pubKeyHex as [string, string],
      commitmentReceipt: commitmentReceiptHex as [string, string, string],
    };
  }
}
