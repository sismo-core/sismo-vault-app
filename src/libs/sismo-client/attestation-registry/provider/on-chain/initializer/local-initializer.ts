import { Attestation } from "../../../types";
import { Initializer } from "./initializer";

export class LocalInitializer extends Initializer {
  public async init(): Promise<{
    attestations: Attestation[];
    block: number;
  }> {
    return {
      attestations: [],
      block: 0,
    };
  }
}
