import { DevRegistryTreeReader } from "../registry-tree-readers/dev-registry-tree-reader";
import { Cache } from "../cache-service";
import { BigNumber, ethers } from "ethers";
import {
  ProofRequest,
  AccountData,
  GetEligibilityInputs,
  RequestIdentifierInputs,
  SismoConnectAppDataSource,
  ExternalDataSource,
} from "./types";

import {
  ClaimType,
  DevConfig,
  ProvingScheme,
} from "../sismo-connect-provers/sismo-connect-prover-v1";
import { RegistryTreeReader } from "../registry-tree-readers/registry-tree-reader";
import { RegistryTreeReaderBase } from "../registry-tree-readers/types";
import {
  HydraS3Account,
  SnarkProof,
  UserParams,
  VaultInput,
} from "@sismo-core/hydra-s3";
import { EddsaSignature, SNARK_FIELD } from "@sismo-core/crypto";
import { CommitmentMapper } from "../commitment-mapper";
import { ImportedAccount } from "../vault-client";
import env from "../../environment";
import { keccak256 } from "ethers/lib/utils";

export abstract class HydraProver {
  protected _registryTreeReader: RegistryTreeReaderBase;

  constructor({ cache }: { cache?: Cache }) {
    this._registryTreeReader = new RegistryTreeReader({ cache });
  }

  public abstract getVersion(): ProvingScheme;
  protected abstract _generateSnarkProof(
    userParams: UserParams
  ): Promise<SnarkProof>;

  public async getRegistryTreeRoot(): Promise<string> {
    const registryTree = await this._registryTreeReader.getRegistryTree();
    return registryTree.getRoot().toHexString();
  }

  public async initDevConfig(devConfig?: DevConfig) {
    if (devConfig && devConfig?.enabled !== false) {
      if (devConfig?.devGroups?.length === 0)
        throw new Error("devGroups is required in devConfig");

      console.log("///////////// DEVMODE /////////////");
      this._registryTreeReader = new DevRegistryTreeReader({
        devGroups: devConfig.devGroups,
      });
    }
  }

  public async generateProof(proofRequest: ProofRequest): Promise<SnarkProof> {
    const userParams = await this._prepareSnarkProofRequest(proofRequest);
    return await this._generateSnarkProof(userParams);
  }

  private async _prepareSnarkProofRequest(
    proofRequest: ProofRequest
  ): Promise<UserParams> {
    let {
      appId,
      source,
      destination,
      vaultSecret,
      namespace,
      groupId,
      groupTimestamp,
      requestedValue,
      claimType,
      extraData,
    } = proofRequest;

    const vaultInput: VaultInput = {
      secret: BigNumber.from(vaultSecret),
      namespace: BigNumber.from(
        keccak256(
          ethers.utils.solidityPack(
            ["uint128", "uint128"],
            [appId, BigNumber.from(0)]
          )
        )
      )
        .mod(SNARK_FIELD)
        .toHexString(),
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

    if (destination) {
      const hydraS2Account: HydraS3Account = this._getHydraAccount(destination);

      userParams["destination"] = {
        ...hydraS2Account,
        verificationEnabled: true,
      };
    }

    if (source) {
      if ((source as ExternalDataSource).commitmentReceipt) {
        source = source as ExternalDataSource;
        userParams["source"] = {
          identifier: source.identifier,
          secret: source.secret,
          commitmentReceipt: source.commitmentReceipt,
          verificationEnabled: true,
        };
      }
      if ((source as SismoConnectAppDataSource).namespace) {
        source = source as SismoConnectAppDataSource;
        userParams["source"] = {
          identifier: source.identifier,
          secret: source.secret,
          namespace: source.namespace,
          verificationEnabled: true,
        };
      }

      const hasDataRequest = groupId && groupTimestamp && requestedValue;

      if (hasDataRequest) {
        const claimedValue = BigNumber.from(requestedValue);

        const requestIdentifier = this._requestIdentifier({
          appId,
          groupId,
          groupTimestamp,
          namespace,
        });

        userParams["requestIdentifier"] = requestIdentifier;
        // HydraS2 typing
        userParams["statement"] = {
          value: BigNumber.from(claimedValue),
          comparator:
            claimType === ClaimType.GTE
              ? 0
              : claimType === ClaimType.EQ
              ? 1
              : null,
          registryTree: await this._registryTreeReader.getRegistryTree(),
          accountsTree: await this._registryTreeReader.getAccountsTree({
            groupId,
            account: source.identifier,
            timestamp: groupTimestamp,
          }),
        };
        // HydraS3 typing
        userParams["claim"] = {
          value: BigNumber.from(claimedValue),
          comparator:
            claimType === ClaimType.GTE
              ? 0
              : claimType === ClaimType.EQ
              ? 1
              : null,
          registryTree: await this._registryTreeReader.getRegistryTree(),
          accountsTree: await this._registryTreeReader.getAccountsTree({
            groupId,
            account: source.identifier,
            timestamp: groupTimestamp,
          }),
        };
      }
    }

    if (extraData) {
      userParams["extraData"] = extraData;
    }

    return userParams;
  }

  private _getHydraAccount = (account: ImportedAccount): HydraS3Account => {
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

  private _requestIdentifier = ({
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

  public async getEligibility({
    accounts,
    groupId,
    groupTimestamp,
    requestedValue,
    claimType,
  }: GetEligibilityInputs): Promise<AccountData> {
    const eligibleAccountsTreeData =
      await this._registryTreeReader.getAccountsTreeEligibility({
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
          if (BigNumber.from(value).eq(requestedValue)) {
            return {
              identifier,
              value: value,
            };
          }
        }
        return null;
      case ClaimType.GTE:
        let maxAccountData: AccountData = null;

        for (const [identifier, value] of Object.entries(
          eligibleAccountsTreeData
        )) {
          if (
            maxAccountData === null &&
            BigNumber.from(value).gte(requestedValue)
          ) {
            maxAccountData = {
              identifier,
              value: value,
            };
          }
          if (
            maxAccountData &&
            BigNumber.from(value).gt(maxAccountData?.value)
          ) {
            maxAccountData = {
              identifier,
              value: value,
            };
          }
        }
        return maxAccountData;

      default:
        throw new Error("Invalid claim type");
    }
  }
}
