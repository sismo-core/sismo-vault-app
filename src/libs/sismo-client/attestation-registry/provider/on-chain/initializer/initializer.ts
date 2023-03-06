import { Attestation } from "../../../types";

export abstract class Initializer {
  abstract init(): Promise<{ attestations: Attestation[]; block: number }>;
}
