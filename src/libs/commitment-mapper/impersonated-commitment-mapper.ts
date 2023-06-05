import { EddsaAccount, SNARK_FIELD, buildPoseidon } from "@sismo-core/crypto";
import {
  CommitmentMapper,
  CommitmentReceiptGithubResult,
  CommitmentReceiptResult,
  CommitmentReceiptTelegramResult,
  CommitmentReceiptTwitterResult,
} from "./commitment-mapper";
import { BigNumber } from "ethers";
import { MemoryCache } from "../cache-service";

export type HashCommitmentReceiptAPIResponse = {
  commitmentMapperPubKey: [string, string];
  commitmentReceipt: [string, string, string];
};

export class ImpersonatedCommitmentMapper extends CommitmentMapper {
  private _cache: MemoryCache;
  private _privateSeed = BigNumber.from(1543534646453).toHexString();
  private _commitmentMapperPubKey: [string, string];

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

  // protected async _commitEddsaFromHandle({
  //   handle, // e.g "github:ben"
  //   commitment,
  // }: {
  //   handle: string;
  //   commitment: string;
  // }): Promise<CommitmentReceiptGithubResult> {
  //   // account = resolveHandle(handle) // github:...

  //   const { commitmentMapperPubKey, commitmentReceipt } =
  //     await this._getCommitmentReceip(, commitment);

  //   return {
  //     commitmentMapperPubKey: null,
  //     commitmentReceipt: null,
  //     account: {
  //       profileId: null,
  //       login: null,
  //       name: null,
  //       avatarUrl: null,
  //       identifier: null,
  //     },
  //   };
  // }

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
      commitmentMapperPubKey: null,
      commitmentReceipt: null,
      account: {
        userId: null,
        username: null,
        identifier: null,
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
      commitmentMapperPubKey: null,
      commitmentReceipt: null,
      account: {
        identifier: null,
        firstName: null,
        lastName: null,
        userId: null,
        username: null,
        photoUrl: null,
        authDate: null,
        hash: null,
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

  protected async _getCommitmentMapperPubKeyFromSeed(
    seed: string
  ): Promise<[string, string]> {
    const eddsaAccount = await EddsaAccount.generateFromSeed(
      BigNumber.from(seed)
    );

    const pubKeyHex = eddsaAccount
      .getPubKey()
      .map((pubKey: BigNumber) => pubKey.toHexString()) as [string, string];

    return pubKeyHex;
  }

  protected async _constructCommitmentReceipt(
    ethAddress: string,
    commitment: string
  ): Promise<HashCommitmentReceiptAPIResponse> {
    // instantiate the eddsaAccount of this commitmentMapper implementation
    // this will be used to sign the receipt

    const eddsaAccount = await EddsaAccount.generateFromSeed(
      BigNumber.from(this._privateSeed)
    );

    // construct the receipt
    const poseidon = await buildPoseidon();
    const ethAddressBigNumber = BigNumber.from(ethAddress.toLowerCase()).mod(
      SNARK_FIELD
    );
    const msg = poseidon([ethAddressBigNumber, commitment]);
    // sign the receipt => this is the commitmentReceipt
    const commitmentReceipt = eddsaAccount.sign(msg);

    // convert bigNumber receipt to HexString
    const commitmentReceiptHex = commitmentReceipt.map((receipt: BigNumber) =>
      receipt.toHexString()
    );
    const pubKeyHex = eddsaAccount
      .getPubKey()
      .map((coord: BigNumber) => coord.toHexString());

    this._commitmentMapperPubKey = pubKeyHex as [string, string];

    return {
      commitmentMapperPubKey: this._commitmentMapperPubKey,
      commitmentReceipt: commitmentReceiptHex as [string, string, string],
    };
  }

  public getPrivateSeed(): string {
    return this._privateSeed;
  }

  public async getCommitmentMapperPubKey(): Promise<[string, string]> {
    if (!this._commitmentMapperPubKey) {
      this._commitmentMapperPubKey =
        await this._getCommitmentMapperPubKeyFromSeed(this._privateSeed);
    }
    return this._commitmentMapperPubKey;
  }
}
