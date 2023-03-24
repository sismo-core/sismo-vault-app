import { ImportedAccount } from "../../vault-client";
import {
  EddsaPublicKey,
  EddsaSignature,
  SNARK_FIELD,
  HydraS2Prover,
  HydraS2Account,
  SnarkProof,
  UserParams,
  VaultInput,
  StatementInput,
  KVMerkleTree,
} from "@sismo-core/hydra-s2";
import { OffchainRegistryTreeReader } from "../registry-tree-readers/offchain-registry-tree-reader";
import { DevRegistryTreeReader } from "../registry-tree-readers/dev-registry-tree-reader";
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
import { ClaimType, DevConfig } from "../zk-connect-prover/zk-connect-v2";

export class HydraS2OffchainProver extends Prover {
  registryTreeReader: OffchainRegistryTreeReader | DevRegistryTreeReader;

  constructor({ cache, devConfig }: { cache?: Cache; devConfig?: DevConfig }) {
    super();
    if (devConfig) {
      this.registryTreeReader = new DevRegistryTreeReader({
        devGroups: devConfig.devGroups,
      });
    } else {
      this.registryTreeReader = new OffchainRegistryTreeReader({ cache });
    }
  }

  public async generateProof({
    appId,
    source,
    vaultSecret,
    namespace,
    groupId,
    groupTimestamp,
    requestedValue,
    claimType,
    devConfig,
  }: OffchainProofRequest): Promise<SnarkProof> {
    const commitmentMapperPubKey =
      env.sismoDestination.commitmentMapperPubKey.map((string) =>
        BigNumber.from(string)
      ) as EddsaPublicKey;

    const prover = new HydraS2Prover(commitmentMapperPubKey, {
      wasmPath: "/hydra/s2_v1/hydra-s2.wasm",
      zkeyPath: "/hydra/s2_v1/hydra-s2.zkey",
    });

    const userParams = await this.prepareSnarkProofRequest({
      appId,
      source,
      vaultSecret,
      namespace,
      groupId,
      groupTimestamp,
      requestedValue,
      claimType,
      devConfig,
    });

    const proof = await prover.generateSnarkProof(userParams);
    return proof;
  }

  public async getEligibility({
    accounts,
    groupId,
    groupTimestamp,
    requestedValue,
    claimType,
    devGroup,
  }: GetEligibilityInputs): Promise<AccountData> {
    const eligibleAccountsTreeData =
      await this.registryTreeReader.getAccountsTreeEligibility({
        accounts,
        groupId,
        timestamp: groupTimestamp,
      });

    if (eligibleAccountsTreeData === null) {
      return null;
    }

    switch (claimType) {
      case ClaimType.EQ:
        for (const [identifier, value] of Object.entries(
          eligibleAccountsTreeData
        )) {
          if (
            BigNumber.from(value).toNumber() ===
            BigNumber.from(requestedValue).toNumber()
          ) {
            return {
              identifier,
              value: BigNumber.from(value).toNumber(),
            };
          }
        }
        return null;

      default:
        let maxAccountData: AccountData = null;
        for (const [identifier, value] of Object.entries(
          eligibleAccountsTreeData
        )) {
          if (
            maxAccountData === null &&
            BigNumber.from(value).toNumber() >=
              BigNumber.from(requestedValue).toNumber()
          ) {
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
          return maxAccountData;
        }
    }
  }

  private getHydraS2Account = (account: ImportedAccount): HydraS2Account => {
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
    claimType,
    devConfig,
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
      const hydraS2Account: HydraS2Account = this.getHydraS2Account(source);

      userParams["source"] = {
        ...hydraS2Account,
        verificationEnabled: true,
      };

      const hasDataRequest =
        namespace && groupId && groupTimestamp && requestedValue && claimType;

      if (hasDataRequest) {
        let accountsTree: KVMerkleTree;
        let registryTree: KVMerkleTree;

        accountsTree = await this.registryTreeReader.getAccountsTree({
          groupId,
          account: source.identifier,
          timestamp: groupTimestamp,
        });

        registryTree = await this.registryTreeReader.getRegistryTree();

        const claimedValue = BigNumber.from(requestedValue);

        const statementInput: StatementInput = {
          value: BigNumber.from(claimedValue),
          comparator: claimType,
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
