import { KVMerkleTree, MerkleTreeData, SNARK_FIELD } from "@sismo-core/hydra-s3";

import { ethers, BigNumber } from "ethers";
import { DevGroup } from "../sismo-connect-provers/sismo-connect-prover-v1";
import {
  OffchainGetAccountsTreeInputs,
  OffchainGetAccountsTreeEligibilityInputs,
  RegistryTreeReaderBase,
} from "./types";
import { getPoseidon } from "../poseidon";

const accountTreeRoots = new Map<string, string>();

export class DevRegistryTreeReader extends RegistryTreeReaderBase {
  private _devGroups: DevGroup[];

  constructor({ devGroups }: { devGroups: DevGroup[] }) {
    super();
    this._devGroups = devGroups;
  }

  public async getAccountsTree({ groupId }: OffchainGetAccountsTreeInputs): Promise<KVMerkleTree> {
    const poseidon = await getPoseidon();
    const devGroup = this._devGroups.find((devGroup) => devGroup.groupId === groupId);

    let groupData = await this.getAccountsTreeData(devGroup);
    let accountTree = new KVMerkleTree(groupData, poseidon, 20);

    if (!accountTreeRoots.has(groupId)) {
      accountTreeRoots.set(groupId, accountTree.getRoot().toHexString());
    }
    return accountTree;
  }

  public async getRegistryTree(): Promise<KVMerkleTree> {
    const poseidon = await getPoseidon();
    const registryTreeData = {};

    for (const devGroup of this._devGroups) {
      let accountsTreeRoot = null;

      if (!accountTreeRoots.has(devGroup.groupId)) {
        const accountsTree = await this.getAccountsTree({
          groupId: devGroup.groupId,
        } as OffchainGetAccountsTreeInputs);
        accountsTreeRoot = accountsTree.getRoot().toHexString();
      } else {
        accountsTreeRoot = accountTreeRoots.get(devGroup.groupId);
      }

      const accountsTreeValue = this.encodeAccountsTreeValue(
        devGroup.groupId,
        devGroup.groupTimestamp
      );

      registryTreeData[accountsTreeRoot] = accountsTreeValue;
    }
    return new KVMerkleTree(registryTreeData, poseidon, 20);
  }

  public async getAccountsTreeEligibility({
    groupId,
    accounts,
  }: OffchainGetAccountsTreeEligibilityInputs): Promise<MerkleTreeData> {
    const devGroup = this._devGroups.find((devGroup) => devGroup.groupId === groupId);

    const merkleTreesData = await this.getAccountsTreeData(devGroup);

    if (!Object.keys(merkleTreesData)?.length) {
      return {};
    }

    const filteredMerkleTreesData = Object.keys(merkleTreesData).reduce((acc, key) => {
      for (let i = 0; i < accounts?.length; i++) {
        if (accounts[i]?.toString()?.toLowerCase() === key?.toString()?.toLowerCase()) {
          acc[key] = merkleTreesData[key];
        }
      }
      return acc;
    }, {});

    return filteredMerkleTreesData;
  }

  protected encodeAccountsTreeValue = (groupId: string, timestamp: number | "latest"): string => {
    const encodedTimestamp =
      timestamp === "latest"
        ? BigNumber.from(ethers.utils.formatBytes32String("latest")).shr(128)
        : BigNumber.from(timestamp);

    const groupSnapshotId = ethers.utils.solidityPack(
      ["uint128", "uint128"],
      [groupId, encodedTimestamp]
    );

    const accountsTreeValue = BigNumber.from(groupSnapshotId).mod(SNARK_FIELD).toHexString();
    return accountsTreeValue;
  };

  protected async getAccountsTreeData(devGroup: DevGroup): Promise<MerkleTreeData> {
    let groupData: MerkleTreeData = {};

    const devAddresses = devGroup?.data;

    if (devAddresses?.length) {
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

    // allow to make sure that each AccountsTree is unique
    const accountsTreeValue = this.encodeAccountsTreeValue(
      devGroup.groupId,
      devGroup.groupTimestamp
    );
    groupData[accountsTreeValue] = 0;

    return groupData;
  }
}
