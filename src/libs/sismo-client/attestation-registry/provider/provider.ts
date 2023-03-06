import { Attestation } from "../types";

export abstract class Provider {
  abstract get(): Promise<Attestation[]>;
  abstract onAttestationRecorded(listener: (attestation: Attestation) => void);
  abstract startListen();
  abstract stopListen();
}
