import { BigNumberish, Contract, Signer } from "ethers";
import { Provider } from "@ethersproject/abstract-provider";
import { Base } from "../commons/abstract/base";
import { ContractABIs, Contracts, SupportedChainId } from "../commons";
import { HydraS1AccountboundAttester } from "../commons/typechain/HydraS1Accountbound";
import { AvailableRootsRegistry } from "../commons/typechain/AvailableRootsRegistry";
import { CommitmentMapperRegistry } from "../commons/typechain/CommitmentMapperRegistry";

export class HydraS1AccountboundAttesterContract extends Base<HydraS1AccountboundAttester> {
  public name = "hydra-s1-accountbound";
  public chainId: SupportedChainId;

  constructor({
    signerOrProvider,
    chainId,
  }: {
    signerOrProvider: Signer | Provider | undefined;
    chainId: SupportedChainId;
  }) {
    super(Contracts.HydraS1AccountboundAttester, signerOrProvider, chainId);

    if (chainId) this.chainId = chainId;
    else this.chainId = 137;
  }

  public async isRootAvailableForAttester(registryRoot: BigNumberish) {
    const contract = this.getInstance();
    const availableRegistryAddress = await contract.getAvailableRootsRegistry();
    const availableRegistry = new Contract(
      availableRegistryAddress,
      ContractABIs.AvailableRootsRegistry,
      this.signerOrProvider
    ) as AvailableRootsRegistry;
    return await availableRegistry.isRootAvailableForAttester(
      this.getAddress(),
      registryRoot
    );
  }

  public async getCommitmentMapperPubKey() {
    const contract = this.getInstance();
    const commitmentMapperRegistry =
      await contract.getCommitmentMapperRegistry();
    const commitmentRegistry = new Contract(
      commitmentMapperRegistry,
      ContractABIs.CommitmentMapperRegistry,
      this.signerOrProvider
    ) as CommitmentMapperRegistry;
    return await commitmentRegistry.getEdDSAPubKey();
  }
}
