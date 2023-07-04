import {
  EddsaPublicKey,
  HydraS3Prover as HydraS3ProverPS,
  SnarkProof,
  UserParams,
} from "@sismo-core/hydra-s3";
import { HydraProver } from "./hydra-prover";
import { ProvingScheme } from "../sismo-connect-provers";
import { BigNumber } from "ethers";
import axios from "axios";
import { RegistryTreeReaderBase } from "../registry-tree-readers/types";

const WASM_PATH = "/hydra/s3/hydra-s3.06-15-2023.wasm";
const ZKEY_PATH = "/hydra/s3/hydra-s3.06-15-2023.zkey";

export class HydraS3Prover extends HydraProver {
  private _hydraS3ProverPS: HydraS3ProverPS;

  constructor({
    registryTreeReader,
    hydraS3ProverPS,
  }: {
    registryTreeReader?: RegistryTreeReaderBase;
    hydraS3ProverPS: HydraS3ProverPS;
  }) {
    super({ registryTreeReader });
    this._hydraS3ProverPS = hydraS3ProverPS;
  }

  static build(
    registryTreeReader: RegistryTreeReaderBase,
    commitmentMapperPubKey: [string, string]
  ): HydraS3Prover {
    const eddsaPublicKey = commitmentMapperPubKey.map((string) =>
      BigNumber.from(string)
    ) as EddsaPublicKey;
    return new HydraS3Prover({
      registryTreeReader,
      hydraS3ProverPS: new HydraS3ProverPS(eddsaPublicKey, {
        wasmPath: WASM_PATH,
        zkeyPath: ZKEY_PATH,
      }),
    });
  }

  public getVersion() {
    return ProvingScheme.HYDRA_S3;
  }

  public async _generateSnarkProof(userParams: UserParams): Promise<SnarkProof> {
    return await this._hydraS3ProverPS.generateSnarkProof(userParams);
  }

  public async fetchZkey(): Promise<void> {
    await axios.get(ZKEY_PATH);
  }
}
