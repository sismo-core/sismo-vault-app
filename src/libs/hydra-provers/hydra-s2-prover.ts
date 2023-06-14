import {
  EddsaPublicKey,
  HydraS2Prover as HydraS2ProverPS,
  SnarkProof,
} from "@sismo-core/hydra-s2";
import { Cache } from "../cache-service";
import { BigNumber } from "ethers";
import { CommitmentMapper } from "../sismo-client";
import { HydraProver } from "./hydra-prover";
import { ProvingScheme } from "../sismo-connect-provers";
import { UserParams as UserParamsS2 } from "@sismo-core/hydra-s2";
import { UserParams } from "@sismo-core/hydra-s3";

export class HydraS2Prover extends HydraProver {
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
    return ProvingScheme.HYDRA_S2;
  }

  public async _generateSnarkProof(
    userParams: UserParams
  ): Promise<SnarkProof> {
    const commitmentMapperPubKey =
      await this._commitmentMapperService.getPubKey();

    const eddsaPublicKey = commitmentMapperPubKey.map((string) =>
      BigNumber.from(string)
    ) as EddsaPublicKey;

    const prover = new HydraS2ProverPS(eddsaPublicKey, {
      wasmPath: "/hydra/s2/hydra-s2.wasm",
      zkeyPath: "/hydra/s2/hydra-s2.zkey",
    });

    const userParamsS2 = {
      vault: userParams.vault,
      source: userParams.source,
      destination: userParams.destination,
      statement: userParams.claim,
      requestIdentifier: userParams.requestIdentifier,
      extraData: userParams.extraData,
    } as UserParamsS2;

    return await prover.generateSnarkProof(userParamsS2);
  }
}
