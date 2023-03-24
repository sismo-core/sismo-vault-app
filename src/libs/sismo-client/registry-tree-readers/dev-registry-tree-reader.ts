import {
  KVMerkleTree,
  MerkleTreeData,
  SNARK_FIELD,
} from "@sismo-core/hydra-s2";

import { RegistryTreeReader } from "./registry-tree-reader";
import { buildPoseidon } from "@sismo-core/hydra-s2";
import { ethers, BigNumber } from "ethers";
import { DevGroup } from "../zk-connect-prover/zk-connect-v2";

export class DevRegistryTreeReader extends RegistryTreeReader {
  public async getAccountsTree({
    devGroup,
  }: {
    devGroup: DevGroup;
  }): Promise<KVMerkleTree> {
    const poseidon = await buildPoseidon();

    let groupData = await this.getAccountsTreeData({ devGroup });

    let _accountsTree = new KVMerkleTree(groupData, poseidon, 20);
    return _accountsTree;
  }

  public async getRegistryTree({
    devGroups,
  }: {
    devGroups: DevGroup[];
  }): Promise<KVMerkleTree> {
    const poseidon = await buildPoseidon();
    const registryTreeData = {};

    for (const devGroup of devGroups) {
      const accountsTree = await this.getAccountsTree({
        devGroup,
      });

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
    accounts,
    devGroup,
  }: {
    accounts: string[];
    devGroup: DevGroup;
  }): Promise<MerkleTreeData> {
    const merkleTreesData = await this.getAccountsTreeData({ devGroup });
    return merkleTreesData;
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

  protected async getAccountsTreeData({
    devGroup,
  }: {
    devGroup: DevGroup;
  }): Promise<MerkleTreeData> {
    let groupData: MerkleTreeData = {};

    const devAddresses = devGroup?.data;
    if (devAddresses?.length > 0) {
      for (const key in devAddresses) {
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
