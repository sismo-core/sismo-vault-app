import { SnarkProof, UserParams } from "@sismo-core/hydra-s1";
import { AccountData, OffchainProofRequest } from "./types";

export abstract class Prover {
  public abstract generateProof(args: any): Promise<SnarkProof>;
  public abstract getEligibility(args: any): Promise<AccountData>;
  protected abstract requestIdentifier(args: any): string;
  protected abstract prepareSnarkProofRequest(
    args: OffchainProofRequest
  ): Promise<UserParams>;
}
