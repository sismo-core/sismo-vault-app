import {
  KVMerkleTree,
  MerkleTreeData,
  SNARK_FIELD,
} from "@sismo-core/hydra-s2";

import { RegistryTreeReader } from "./registry-tree-reader";
import { buildPoseidon } from "@sismo-core/hydra-s2";
import { ethers, BigNumber } from "ethers";
import { DevGroup } from "../zk-connect-prover/zk-connect-v2";
import {
  OffchainGetAccountsTreeInputs,
  OffchainGetAccountsTreeEligibilityInputs,
} from "./types";

export class DevRegistryTreeReader extends RegistryTreeReader {
  private _devGroups: DevGroup[];

  constructor({ devGroups }: { devGroups: DevGroup[] }) {
    super();
    this._devGroups = devGroups;
  }

  public async getAccountsTree({
    groupId,
  }: OffchainGetAccountsTreeInputs): Promise<KVMerkleTree> {
    const poseidon = await buildPoseidon();
    const devGroup = this._devGroups.find(
      (devGroup) => devGroup.groupId === groupId
    );

    let groupData = await this.getAccountsTreeData(devGroup);

    let _accountsTree = new KVMerkleTree(groupData, poseidon, 20);
    return _accountsTree;
  }

  public async getRegistryTree(): Promise<KVMerkleTree> {
    const poseidon = await buildPoseidon();
    const registryTreeData = {};

    for (const devGroup of this._devGroups) {
      const accountsTree = await this.getAccountsTree({
        groupId: devGroup.groupId,
      } as OffchainGetAccountsTreeInputs);

      const accountsTreeValue = this.encodeAccountsTreeValue(
        devGroup.groupId,
        devGroup.groupTimestamp
      );

      registryTreeData[accountsTree.getRoot().toHexString()] =
        accountsTreeValue;
    }
    const registryTree = new KVMerkleTree(registryTreeData, poseidon, 20);
    return registryTree;
  }

  public async getAccountsTreeEligibility({
    groupId,
    accounts,
  }: OffchainGetAccountsTreeEligibilityInputs): Promise<MerkleTreeData> {
    const devGroup = this._devGroups.find(
      (devGroup) => devGroup.groupId === groupId
    );

    const merkleTreesData = await this.getAccountsTreeData(devGroup);

    if (!Object.keys(merkleTreesData)?.length) {
      return {};
    }

    const filteredMerkleTreesData = Object.keys(merkleTreesData).reduce(
      (acc, key) => {
        for (let i = 0; i < accounts?.length; i++) {
          if (
            accounts[i]?.toString()?.toLowerCase() ===
            key?.toString()?.toLowerCase()
          ) {
            acc[key] = merkleTreesData[key];
          }
        }
        return acc;
      },
      {}
    );

    return filteredMerkleTreesData;
  }

  protected encodeAccountsTreeValue = (
    groupId: string,
    timestamp: number | "latest"
  ): string => {
    const encodedTimestamp =
      timestamp === "latest"
        ? BigNumber.from(ethers.utils.formatBytes32String("latest")).shr(128)
        : BigNumber.from(timestamp);

    const groupSnapshotId = ethers.utils.solidityPack(
      ["uint128", "uint128"],
      [groupId, encodedTimestamp]
    );

    const accountsTreeValue = BigNumber.from(groupSnapshotId)
      .mod(SNARK_FIELD)
      .toHexString();
    return accountsTreeValue;
  };

  protected async getAccountsTreeData(
    devGroup: DevGroup
  ): Promise<MerkleTreeData> {
    let groupData: MerkleTreeData = {};

    const devAddresses = devGroup?.data;
    if (devAddresses?.length > 0) {
      for (const key of devAddresses as string[]) {
        groupData[key.toLowerCase()] = 1;
      }
    }

    if (!devAddresses?.length) {
      groupData = Object.keys(devAddresses).reduce((acc, key) => {
        acc[key.toLowerCase()] = devAddresses[key];
        return acc;
      }, {} as { [accountIdentifier: string]: number });
    }

    return groupData;
  }
}
