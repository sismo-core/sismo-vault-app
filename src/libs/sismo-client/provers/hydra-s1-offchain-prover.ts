import { ImportedAccount } from "../../vault-client";
import {
  EddsaPublicKey,
  EddsaSignature,
  SNARK_FIELD,
  HydraS1Prover,
  HydraS1Account,
  SnarkProof,
  DestinationInput,
} from "@sismo-core/hydra-s1";
import { OffchainRegistryTreeReader } from "../registry-tree-readers/offchain-registry-tree-reader";
import { Cache } from "../caches";
import { ethers, BigNumber } from "ethers";
import { CommitmentMapper } from "..";
import { OffchainProofRequest, AccountData } from "./types";
import { Prover } from "./prover";
import env from "../../../environment";

export class HydraS1OffchainProver extends Prover {
  registryTreeReader: OffchainRegistryTreeReader;

  constructor({ cache }: { cache: Cache }) {
    super();
    this.registryTreeReader = new OffchainRegistryTreeReader({ cache });
  }

  public async generateProof({
    appId,
    serviceName = "main",
    acceptHigherValues,
    value,
    source,
    groupId,
    groupTimestamp,
  }: OffchainProofRequest): Promise<SnarkProof> {
    const accountsTree = await this.registryTreeReader.getAccountsTree({
      groupId,
      account: source.identifier,
      timestamp: groupTimestamp,
    });

    const registryTree = await this.registryTreeReader.getRegistryTree();

    const commitmentMapperPubKey =
      env.sismoDestination.commitmentMapperPubKey.map((string) =>
        BigNumber.from(string)
      ) as EddsaPublicKey;

    const commitmentReceipt = env.sismoDestination.commitmentReceipt.map(
      (string) => BigNumber.from(string)
    ) as EddsaSignature;

    const destination: DestinationInput = {
      identifier: env.sismoDestination.address,
      secret: BigNumber.from(env.sismoDestination.sec),
      commitmentReceipt: commitmentReceipt,
      chainId: BigNumber.from(0),
    };

    const chainId = 0;
    const claimedValue =
      value === "MAX"
        ? accountsTree.getValue(source.identifier)
        : BigNumber.from(value);

    const isStrict = !acceptHigherValues;
    const hydraS1Account = this.getHydraS1Account(source);
    const requestIdentifier = this.requestIdentifier({
      appId,
      groupId,
      timestamp: groupTimestamp,
      serviceName,
    });

    const prover = new HydraS1Prover(commitmentMapperPubKey, {
      wasmPath: "/hydra/v1.0.6/hydra-s1.wasm",
      zkeyPath: "/hydra/v1.0.6/hydra-s1.zkey",
    });

    // const proof = await prover.generateSnarkProof({
    //   source: hydraS1Account,
    //   destination,
    //   claimedValue,
    //   chainId,
    //   accountsTree,
    //   externalNullifier: requestIdentifier,
    //   isStrict,
    // });

    let proof: SnarkProof = null;
    return proof;
  }

  public async getEligibility({
    accounts,
    groupId,
    timestamp,
    value,
    acceptHigherValues,
  }: {
    accounts: string[];
    groupId: string;
    timestamp: number | "latest";
    value: number | "MAX";
    acceptHigherValues: boolean;
  }): Promise<AccountData> {
    const eligibleAccountsTreeData =
      await this.registryTreeReader.getAccountsTreeEligibility({
        groupId,
        timestamp,
        accounts,
      });

    if (eligibleAccountsTreeData === null) {
      return null;
    }

    if (!acceptHigherValues) {
      for (const entry of Object.entries(eligibleAccountsTreeData)) {
        if (BigNumber.from(entry[1]).toNumber() === value) {
          return {
            identifier: entry[0],
            value: BigNumber.from(entry[1]).toNumber(),
          };
        }
      }
      return null;
    }

    if (value === "MAX" || acceptHigherValues) {
      let maxAccountData: AccountData = null;
      for (const entry of Object.entries(eligibleAccountsTreeData)) {
        if (maxAccountData === null) {
          maxAccountData = {
            identifier: entry[0],
            value: BigNumber.from(entry[1]).toNumber(),
          };
        } else {
          if (BigNumber.from(entry[1]).toNumber() > maxAccountData.value) {
            maxAccountData = {
              identifier: entry[0],
              value: BigNumber.from(entry[1]).toNumber(),
            };
          }
        }
      }
      return maxAccountData;
    }
  }

  private getHydraS1Account = (account: ImportedAccount): HydraS1Account => {
    const secret = CommitmentMapper.generateCommitmentMapperSecret(
      account.seed
    );
    const commitmentReceipt = [
      BigNumber.from(account.commitmentReceipt[0]),
      BigNumber.from(account.commitmentReceipt[1]),
      BigNumber.from(account.commitmentReceipt[2]),
    ] as EddsaSignature;
    return {
      identifier: account.identifier,
      secret,
      commitmentReceipt,
    };
  };

  protected requestIdentifier = ({
    appId,
    groupId,
    timestamp,
    serviceName,
  }: {
    appId: string;
    groupId: string;
    timestamp: number | "latest";
    serviceName: string;
  }): string => {
    const encodedTimestamp =
      timestamp === "latest"
        ? BigNumber.from(ethers.utils.formatBytes32String("latest")).shr(128)
        : BigNumber.from(timestamp);

    const groupSnapshotId = ethers.utils.solidityPack(
      ["uint128", "uint128"],
      [groupId, encodedTimestamp]
    );

    const hashedServiceName = BigNumber.from(
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes(serviceName))
    ).shr(128);

    const serviceId = ethers.utils.solidityPack(
      ["uint128", "uint128"],
      [appId, hashedServiceName]
    );

    const requestIdentifier = BigNumber.from(
      ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["bytes32", "bytes32"],
          [serviceId, groupSnapshotId]
        )
      )
    )
      .mod(SNARK_FIELD)
      .toHexString();
    return requestIdentifier;
  };
}
