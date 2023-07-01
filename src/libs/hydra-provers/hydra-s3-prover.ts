import {
  EddsaPublicKey,
  HydraS3Prover as HydraS3ProverPS,
  SnarkProof,
  UserParams,
} from "@sismo-core/hydra-s3";
import { Cache } from "../cache-service";
import { HydraProver } from "./hydra-prover";
import { ProvingScheme } from "../sismo-connect-provers";
import { BigNumber } from "ethers";

export class HydraS3Prover extends HydraProver {
  private _hydraS3ProverPS: HydraS3ProverPS;

  constructor({ cache, hydraS3ProverPS }: { cache?: Cache; hydraS3ProverPS: HydraS3ProverPS }) {
    super({ cache });
    this._hydraS3ProverPS = hydraS3ProverPS;
  }

  static build(cache: Cache, commitmentMapperPubKey: [string, string]): HydraS3Prover {
    const eddsaPublicKey = commitmentMapperPubKey.map((string) =>
      BigNumber.from(string)
    ) as EddsaPublicKey;
    return new HydraS3Prover({
      cache,
      hydraS3ProverPS: new HydraS3ProverPS(eddsaPublicKey, {
        wasmPath: "/hydra/s3/hydra-s3.wasm",
        zkeyPath: "/hydra/s3/hydra-s3.zkey",
      }),
    });
  }

  public getVersion() {
    return ProvingScheme.HYDRA_S3;
  }

  public async _generateSnarkProof(userParams: UserParams): Promise<SnarkProof> {
    return await this._hydraS3ProverPS.generateSnarkProof(userParams);
  }
}
