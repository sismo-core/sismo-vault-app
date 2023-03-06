import { SnarkProof } from "@sismo-core/hydra-s1";
import { AccountData } from "./types";

export abstract class Prover {
  public abstract generateProof(args: any): Promise<SnarkProof>;
  public abstract getEligibility(args: any): Promise<AccountData>;
  protected abstract requestIdentifier(args: any): string;
}
