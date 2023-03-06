import {
  EddsaPublicKey,
  EddsaSignature,
  HydraS1Account,
  HydraS1Prover,
  KVMerkleTree,
} from "@sismo-core/hydra-s1";
import { BigNumber, ethers } from "ethers";
import { Claim, CommitmentMapper } from "../..";
import { ImportedAccount } from "../../../vault-client";
import { AvailableGroups, GroupProperties } from "../hydraS1/types";

export type HydraS1ProofRequest = {
  registryTree: KVMerkleTree;
  accountsTree: KVMerkleTree;
  isStrict: boolean;
  groupId: string;
  groupProperties: GroupProperties;
  sources: ImportedAccount[];
  destination: ImportedAccount;
  externalNullifier: BigNumber;
  value: string;
  internalCollectionId: number;
  chainId: number;
};

export type HydraS1Proof = {
  claim: Claim;
  proofData: string;
};

export class HydraS1ZKPS {
  public async generateProofs(
    proofRequests: HydraS1ProofRequest[],
    availableGroups: AvailableGroups
  ): Promise<HydraS1Proof[]> {
    return await Promise.all(
      proofRequests.map((proofRequest) =>
        this.generateProof(proofRequest, availableGroups)
      )
    );
  }

  public async generateProof(
    proofRequest: HydraS1ProofRequest,
    availableGroups: AvailableGroups
  ): Promise<HydraS1Proof> {
    const importedSource = proofRequest.sources[0];
    const importedDestination = proofRequest.destination;

    const source = this.getHydraS1Account(importedSource);
    const destination = this.getHydraS1Account(importedDestination);

    const commitmentMapperPubKey = this.getCommitmentMapperPubKey(
      importedSource,
      importedDestination
    );
    const claimedValue = proofRequest.value;
    const chainId = proofRequest.chainId;
    const externalNullifier = proofRequest.externalNullifier;

    const isStrict = proofRequest.isStrict;
    const accountsTree = proofRequest.accountsTree;

    const prover = new HydraS1Prover(
      proofRequest.registryTree,
      commitmentMapperPubKey,
      {
        wasmPath: "/hydra/v1.0.6/hydra-s1.wasm",
        zkeyPath: "/hydra/v1.0.6/hydra-s1.zkey",
      }
    );

    const proof = await prover.generateSnarkProof({
      source,
      destination,
      claimedValue,
      chainId,
      accountsTree,
      externalNullifier,
      isStrict,
    });

    const claim = {
      groupId: proofRequest.groupId,
      claimedValue: Number(claimedValue),
      extraData: this.encodeGroupProperties(proofRequest.groupProperties),
    };

    return {
      claim,
      proofData: proof.toBytes(),
    };
  }

  private encodeGroupProperties = (
    groupProperties: GroupProperties
  ): string => {
    let values = [
      groupProperties.internalCollectionId,
      groupProperties.generationTimestamp,
      groupProperties.isScore,
    ];
    let types = ["uint128", "uint32", "bool"];
    if (
      groupProperties.cooldownDuration ||
      groupProperties.cooldownDuration === 0
    ) {
      values = [
        groupProperties.internalCollectionId,
        groupProperties.generationTimestamp,
        groupProperties.cooldownDuration,
        groupProperties.isScore,
      ];
      types = ["uint128", "uint32", "uint32", "bool"];
    }
    return ethers.utils.defaultAbiCoder.encode(types, values);
  };

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

  private getCommitmentMapperPubKey = (
    source: ImportedAccount,
    destination: ImportedAccount
  ): EddsaPublicKey => {
    if (
      JSON.stringify(source.commitmentMapperPubKey) !==
      JSON.stringify(destination.commitmentMapperPubKey)
    ) {
      throw new Error(
        "Commitment mapper pub key of source and destination must be the same"
      );
    }

    return [
      BigNumber.from(source.commitmentMapperPubKey[0]),
      BigNumber.from(source.commitmentMapperPubKey[1]),
    ];
  };
}
