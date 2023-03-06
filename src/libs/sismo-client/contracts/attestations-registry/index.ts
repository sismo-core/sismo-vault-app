import { Signer } from "ethers";
import { Base } from "../commons/abstract/base";
import { Provider } from "@ethersproject/abstract-provider";
import { AttestationsRegistry } from "../commons/typechain";
import { Contracts, SupportedChainId } from "../commons";

export class AttestationsRegistryContract extends Base<AttestationsRegistry> {
  constructor({
    signerOrProvider,
    chainId,
  }: {
    signerOrProvider?: Signer | Provider | undefined;
    chainId: SupportedChainId;
  }) {
    super(Contracts.AttestationsRegistry, signerOrProvider, chainId);
    if (chainId) this.chainId = chainId;
    else this.chainId = 137;
  }

  public getAddress(): string {
    return super.getAddress();
  }
}
