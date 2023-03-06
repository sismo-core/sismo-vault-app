import { Attestation } from "../../../types";
import { Initializer } from "./initializer";
import { getAttestations } from "../../../../services/s3AttestationCache";

export class S3Initializer extends Initializer {
  private chainId: number;

  constructor({ chainId }: { chainId: number }) {
    super();
    this.chainId = chainId;
  }

  public async init(): Promise<{
    attestations: Attestation[];
    block: number;
  }> {
    let res = await getAttestations(this.chainId);
    return {
      block: res.block,
      attestations: res.attestations,
    };
  }
}
