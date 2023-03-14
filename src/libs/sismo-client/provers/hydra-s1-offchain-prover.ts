import { buildPoseidon } from "@sismo-core/crypto";
import { ImportedAccount } from "../../vault-client";
import {
  EddsaPublicKey,
  EddsaSignature,
  SNARK_FIELD,
  HydraS1Prover,
  HydraS1Account,
  SnarkProof,
  UserParams,
  VaultInput,
  StatementInput,
  KVMerkleTree,
} from "@sismo-core/hydra-s1";
import { OffchainRegistryTreeReader } from "../registry-tree-readers/offchain-registry-tree-reader";
import { Cache } from "../caches";
import { ethers, BigNumber } from "ethers";
import { CommitmentMapper } from "..";
import {
  OffchainProofRequest,
  AccountData,
  RequestIdentifierInputs,
  GetEligibilityInputs,
} from "./types";
import { Prover } from "./prover";
import env from "../../../environment";
import { overrideEligibleGroupDataFormatter } from "../../zk-connect/utils";

export class HydraS1OffchainProver extends Prover {
  registryTreeReader: OffchainRegistryTreeReader;

  constructor({ cache }: { cache: Cache }) {
    super();
    this.registryTreeReader = new OffchainRegistryTreeReader({ cache });
  }

  public async generateProof({
    appId,
    source,
    vaultSecret,
    namespace,
    groupId,
    groupTimestamp,
    requestedValue,
    comparator,
    devModeOverrideEligibleGroupData,
  }: OffchainProofRequest): Promise<SnarkProof> {
    const commitmentMapperPubKey =
      env.sismoDestination.commitmentMapperPubKey.map((string) =>
        BigNumber.from(string)
      ) as EddsaPublicKey;

    const prover = new HydraS1Prover(commitmentMapperPubKey, {
      wasmPath: "/hydra/v2.0.0-beta/hydra-s1.wasm",
      zkeyPath: "/hydra/v2.0.0-beta/hydra-s1.zkey",
    });

    const userParams = await this.prepareSnarkProofRequest({
      appId,
      source,
      vaultSecret,
      namespace,
      groupId,
      groupTimestamp,
      requestedValue,
      comparator,
      devModeOverrideEligibleGroupData,
    });

    const proof = await prover.generateSnarkProof(userParams);
    return proof;
  }

  public async getEligibility({
    accounts,
    groupId,
    groupTimestamp,
    requestedValue,
    comparator,
  }: GetEligibilityInputs): Promise<AccountData> {
    const eligibleAccountsTreeData =
      await this.registryTreeReader.getAccountsTreeEligibility({
        groupId,
        timestamp: groupTimestamp,
        accounts,
      });

    if (eligibleAccountsTreeData === null) {
      return null;
    }

    if (comparator === "EQ") {
      for (const [identifier, value] of Object.entries(
        eligibleAccountsTreeData
      )) {
        if (BigNumber.from(value).toNumber() === value) {
          return {
            identifier,
            value: BigNumber.from(value).toNumber(),
          };
        }
      }
      return null;
    }

    if (requestedValue === "USER_SELECTED_VALUE" || comparator === "GTE") {
      let maxAccountData: AccountData = null;
      for (const [identifier, value] of Object.entries(
        eligibleAccountsTreeData
      )) {
        if (maxAccountData === null) {
          maxAccountData = {
            identifier,
            value: BigNumber.from(value).toNumber(),
          };
        } else {
          if (BigNumber.from(value).toNumber() > maxAccountData.value) {
            maxAccountData = {
              identifier,
              value: BigNumber.from(value).toNumber(),
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
    groupTimestamp,
    namespace,
  }: RequestIdentifierInputs): string => {
    const encodedTimestamp =
      groupTimestamp === "latest"
        ? BigNumber.from(ethers.utils.formatBytes32String("latest")).shr(128)
        : BigNumber.from(groupTimestamp);

    const groupSnapshotId = ethers.utils.solidityPack(
      ["uint128", "uint128"],
      [groupId, encodedTimestamp]
    );

    const hashedServiceName = BigNumber.from(
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes(namespace))
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

  protected async prepareSnarkProofRequest({
    appId,
    source,
    vaultSecret,
    namespace,
    groupId,
    groupTimestamp,
    requestedValue,
    comparator,
    devModeOverrideEligibleGroupData,
  }: OffchainProofRequest): Promise<UserParams> {
    const vaultInput: VaultInput = {
      secret: BigNumber.from(vaultSecret),
      namespace: appId,
    };

    // Return only the vault input if we are in demo mode
    if (env.name === "DEMO") {
      return {
        vault: vaultInput,
      };
    }

    let userParams: UserParams = {
      vault: vaultInput,
    };

    if (source) {
      const hydraS1Account: HydraS1Account = this.getHydraS1Account(source);

      userParams["source"] = {
        ...hydraS1Account,
        verificationEnabled: true,
      };

      const hasDataRequest =
        namespace && groupId && groupTimestamp && requestedValue && comparator;

      if (hasDataRequest) {
        let accountsTree: KVMerkleTree;
        let registryTree: KVMerkleTree;
        if (!devModeOverrideEligibleGroupData) {
          accountsTree = await this.registryTreeReader.getAccountsTree({
            groupId,
            account: source.identifier,
            timestamp: groupTimestamp,
          });

          registryTree = await this.registryTreeReader.getRegistryTree();
        } else {
          const poseidon = await buildPoseidon();
          accountsTree = new KVMerkleTree(
            overrideEligibleGroupDataFormatter(
              devModeOverrideEligibleGroupData
            ),
            poseidon,
            20
          );
          const accountsTreeValue = this.encodeAccountsTreeValue(
            groupId,
            groupTimestamp
          );
          const registryTreeData = {
            [accountsTree.getRoot().toHexString()]: accountsTreeValue,
          };
          registryTree = new KVMerkleTree(registryTreeData, poseidon, 20);
        }

        const claimedValue =
          requestedValue === "USER_SELECTED_VALUE"
            ? accountsTree.getValue(source.identifier)
            : BigNumber.from(requestedValue);

        const parsedComparator = "GTE" ? 0 : 1;

        const statementInput: StatementInput = {
          value: BigNumber.from(claimedValue),
          comparator: parsedComparator,
          registryTree: registryTree,
          accountsTree: accountsTree,
        };

        const requestIdentifier = this.requestIdentifier({
          appId,
          groupId,
          groupTimestamp,
          namespace,
        });

        userParams["requestIdentifier"] = requestIdentifier;
        userParams["statement"] = statementInput;
      }
    }

    return userParams;
  }
}
