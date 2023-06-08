import { SnarkProof } from "@sismo-core/hydra-s2";
import { AccountData } from "./types";

export abstract class HydraProver {
  public abstract generateProof(args: any): Promise<SnarkProof>;
  public abstract getEligibility(args: any): Promise<AccountData>;
}
