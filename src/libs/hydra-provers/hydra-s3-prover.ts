import {
  EddsaPublicKey,
  HydraS3Prover as HydraS3ProverPS,
  SnarkProof,
  UserParams,
} from "@sismo-core/hydra-s3";
import { Cache } from "../cache-service";
import { BigNumber } from "ethers";
import { CommitmentMapper } from "../sismo-client";
import { HydraProver } from "./hydra-prover";
import { ProvingScheme } from "../sismo-connect-provers";

export class HydraS3Prover extends HydraProver {
  private _commitmentMapperService: CommitmentMapper;

  constructor({
    cache,
    commitmentMapperService,
  }: {
    cache?: Cache;
    commitmentMapperService: CommitmentMapper;
  }) {
    super({ cache });
    this._commitmentMapperService = commitmentMapperService;
  }

  public getVersion() {
    return ProvingScheme.HYDRA_S3;
  }

  public async _generateSnarkProof(
    userParams: UserParams
  ): Promise<SnarkProof> {
    const commitmentMapperPubKey =
      await this._commitmentMapperService.getPubKey();

    const eddsaPublicKey = commitmentMapperPubKey.map((string) =>
      BigNumber.from(string)
    ) as EddsaPublicKey;

    const prover = new HydraS3ProverPS(eddsaPublicKey, {
      wasmPath: "/hydra/s3/hydra-s3.wasm",
      zkeyPath: "/hydra/s3/hydra-s3.zkey",
    });

    return await prover.generateSnarkProof(userParams);
  }
}
