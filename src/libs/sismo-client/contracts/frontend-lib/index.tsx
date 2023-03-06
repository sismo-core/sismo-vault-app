import { BigNumberish, Signer } from "ethers";
import { Contracts } from "../..";
import { Provider } from "@ethersproject/abstract-provider";
import { Base } from "../commons/abstract/base";
import { FrontendLib } from "../commons/typechain/FrontendLib";

export class FrontendLibContract extends Base<FrontendLib> {
  constructor({
    signerOrProvider,
    chainId,
  }: {
    signerOrProvider: Signer | Provider | undefined;
    chainId: number;
  }) {
    super(Contracts.FrontendLib, signerOrProvider, chainId);
    this.instances = {};
    this.signerOrProvider = signerOrProvider;
    this.contractName = "FrontendLib";
  }

  public async getHydraS1AccountboundAttesterDestinationOfNullifierBatch(
    nullifiers: BigNumberish[]
  ) {
    const frontendLib = this.getInstance();
    return await frontendLib.getHydraS1AccountboundAttesterDestinationOfNullifierBatch(
      nullifiers
    );
  }
}
