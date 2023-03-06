import { Contract, Signer } from "ethers";
import { ContractABIs, Contracts } from "..";
import { Provider } from "@ethersproject/abstract-provider";
import env from "../../../../../environment";

export abstract class Base<T extends Contract> {
  public contractName: string;
  public instances: Record<number, T>;
  public signerOrProvider: Signer | Provider | undefined;
  public chainId: number;

  constructor(
    contractName: Contracts,
    signerOrProvider: Signer | Provider | null,
    chainId: number
  ) {
    this.contractName = contractName;
    this.instances = {};
    this.signerOrProvider = signerOrProvider;
    this.chainId = chainId;
  }

  public getAddress(): string {
    return env.contracts[this.chainId][this.contractName].address;
  }

  public getInstance = (): T => {
    if (!this.instances[this.chainId]) {
      this.instances[this.chainId] = new Contract(
        this.getAddress(),
        ContractABIs[this.contractName],
        this.signerOrProvider
      ) as T;
    }

    return this.instances[this.chainId];
  };
}
