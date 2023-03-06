import { BytesLike, Signer } from "ethers";
import { Base } from "../commons/abstract/base";
import { Provider } from "@ethersproject/abstract-provider";
import { Front, RequestStruct } from "../commons/typechain";
import { Contracts, SupportedChainId } from "../..";

export class FrontContract extends Base<Front> {
  constructor({
    signerOrProvider,
    chainId,
  }: {
    signerOrProvider: Signer | Provider | undefined;
    chainId: SupportedChainId;
  }) {
    super(Contracts.Front, signerOrProvider, chainId);
    if (chainId) this.chainId = chainId;
    else this.chainId = 137;
  }

  public async generateAttestation(
    attesterAddress: string,
    request: RequestStruct,
    proofData: BytesLike
  ) {
    const front = this.getInstance();
    await front.generateAttestations(attesterAddress, request, proofData);
  }
}
