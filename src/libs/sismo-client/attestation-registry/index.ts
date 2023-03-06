import { LocalInitializer } from "./provider/on-chain/initializer/local-initializer";
import { S3Initializer } from "./provider/on-chain/initializer/s3-initializer";
import { AttestationRegistryClient } from "./client";
import { OnChainRegistryProvider } from "./provider/on-chain/on-chain-provider";
import { Provider } from "@ethersproject/abstract-provider";

export * from "./client";

export class OnChainAttestationRegistry extends AttestationRegistryClient {
  constructor({
    chainId,
    logsLimit,
    contractABI,
    contractAddress,
    provider,
  }: {
    chainId: number;
    logsLimit: number;
    contractABI: any;
    contractAddress: string;
    provider: Provider;
  }) {
    const initializer =
      chainId === 31337
        ? new LocalInitializer()
        : new S3Initializer({
            chainId: chainId,
          });

    const onChainRegistryProvider = new OnChainRegistryProvider({
      chainId,
      initializer,
      logsLimit,
      provider,
      contract: {
        address: contractAddress,
        abi: contractABI,
      },
    });

    super({ registryProvider: onChainRegistryProvider });
  }
}
