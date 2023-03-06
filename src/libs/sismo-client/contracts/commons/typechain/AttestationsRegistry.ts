/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";
import { AttestationDeletedEventFilter } from ".";
import {
  AttestationStruct,
  AttestationStructOutput,
} from "./HydraS1SimpleAttester";

export type RangeStruct = { min: BigNumberish; max: BigNumberish };

export type RangeStructOutput = [BigNumber, BigNumber] & {
  min: BigNumber;
  max: BigNumber;
};

export type AttestationDataStruct = {
  issuer: string;
  value: BigNumberish;
  timestamp: BigNumberish;
  extraData: BytesLike;
};

export type AttestationDataStructOutput = [
  string,
  BigNumber,
  number,
  string
] & { issuer: string; value: BigNumber; timestamp: number; extraData: string };

export interface AttestationsRegistryInterface extends utils.Interface {
  contractName: "AttestationsRegistry";
  functions: {
    "authorizeRange(address,uint256,uint256)": FunctionFragment;
    "authorizeRanges(address,(uint256,uint256)[])": FunctionFragment;
    "deleteAttestations(address[],uint256[])": FunctionFragment;
    "getAttestationData(uint256,address)": FunctionFragment;
    "getAttestationDataBatch(uint256[],address[])": FunctionFragment;
    "getAttestationDataTuple(uint256,address)": FunctionFragment;
    "getAttestationExtraData(uint256,address)": FunctionFragment;
    "getAttestationIssuer(uint256,address)": FunctionFragment;
    "getAttestationTimestamp(uint256,address)": FunctionFragment;
    "getAttestationValue(uint256,address)": FunctionFragment;
    "getAttestationValueBatch(uint256[],address[])": FunctionFragment;
    "hasAttestation(uint256,address)": FunctionFragment;
    "initialize(address)": FunctionFragment;
    "isAuthorized(address,uint256)": FunctionFragment;
    "owner()": FunctionFragment;
    "pause()": FunctionFragment;
    "paused()": FunctionFragment;
    "recordAttestations((uint256,address,address,uint256,uint32,bytes)[])": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
    "unauthorizeRange(address,uint256,uint256,uint256)": FunctionFragment;
    "unauthorizeRanges(address,(uint256,uint256)[],uint256[])": FunctionFragment;
    "unpause()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "authorizeRange",
    values: [string, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "authorizeRanges",
    values: [string, RangeStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "deleteAttestations",
    values: [string[], BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "getAttestationData",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "getAttestationDataBatch",
    values: [BigNumberish[], string[]]
  ): string;
  encodeFunctionData(
    functionFragment: "getAttestationDataTuple",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "getAttestationExtraData",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "getAttestationIssuer",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "getAttestationTimestamp",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "getAttestationValue",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "getAttestationValueBatch",
    values: [BigNumberish[], string[]]
  ): string;
  encodeFunctionData(
    functionFragment: "hasAttestation",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(functionFragment: "initialize", values: [string]): string;
  encodeFunctionData(
    functionFragment: "isAuthorized",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(functionFragment: "pause", values?: undefined): string;
  encodeFunctionData(functionFragment: "paused", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "recordAttestations",
    values: [AttestationStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "unauthorizeRange",
    values: [string, BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "unauthorizeRanges",
    values: [string, RangeStruct[], BigNumberish[]]
  ): string;
  encodeFunctionData(functionFragment: "unpause", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "authorizeRange",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "authorizeRanges",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "deleteAttestations",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAttestationData",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAttestationDataBatch",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAttestationDataTuple",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAttestationExtraData",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAttestationIssuer",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAttestationTimestamp",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAttestationValue",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAttestationValueBatch",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "hasAttestation",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "isAuthorized",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "pause", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "paused", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "recordAttestations",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "unauthorizeRange",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "unauthorizeRanges",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "unpause", data: BytesLike): Result;

  events: {
    "AttestationDeleted(tuple)": EventFragment;
    "AttestationRecorded(tuple)": EventFragment;
    "IssuerAuthorized(address,uint256,uint256)": EventFragment;
    "IssuerUnauthorized(address,uint256,uint256)": EventFragment;
    "OwnershipTransferred(address,address)": EventFragment;
    "Paused(address)": EventFragment;
    "Unpaused(address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "AttestationDeleted"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "AttestationRecorded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "IssuerAuthorized"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "IssuerUnauthorized"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Paused"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Unpaused"): EventFragment;
}

export type AttestationRecordedEvent = TypedEvent<
  [AttestationStructOutput],
  { attestation: AttestationStructOutput }
>;

export type AttestationRecordedEventFilter =
  TypedEventFilter<AttestationRecordedEvent>;

export type IssuerAuthorizedEvent = TypedEvent<
  [string, BigNumber, BigNumber],
  { issuer: string; firstCollectionId: BigNumber; lastCollectionId: BigNumber }
>;

export type IssuerAuthorizedEventFilter =
  TypedEventFilter<IssuerAuthorizedEvent>;

export type IssuerUnauthorizedEvent = TypedEvent<
  [string, BigNumber, BigNumber],
  { issuer: string; firstCollectionId: BigNumber; lastCollectionId: BigNumber }
>;

export type IssuerUnauthorizedEventFilter =
  TypedEventFilter<IssuerUnauthorizedEvent>;

export type OwnershipTransferredEvent = TypedEvent<
  [string, string],
  { previousOwner: string; newOwner: string }
>;

export type OwnershipTransferredEventFilter =
  TypedEventFilter<OwnershipTransferredEvent>;

export type PausedEvent = TypedEvent<[string], { account: string }>;

export type PausedEventFilter = TypedEventFilter<PausedEvent>;

export type UnpausedEvent = TypedEvent<[string], { account: string }>;

export type UnpausedEventFilter = TypedEventFilter<UnpausedEvent>;

export interface AttestationsRegistry extends BaseContract {
  contractName: "AttestationsRegistry";
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: AttestationsRegistryInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    authorizeRange(
      issuer: string,
      firstCollectionId: BigNumberish,
      lastCollectionId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    authorizeRanges(
      issuer: string,
      ranges: RangeStruct[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    deleteAttestations(
      owners: string[],
      collectionIds: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    getAttestationData(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<[AttestationDataStructOutput]>;

    getAttestationDataBatch(
      collectionIds: BigNumberish[],
      owners: string[],
      overrides?: CallOverrides
    ): Promise<[AttestationDataStructOutput[]]>;

    getAttestationDataTuple(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<[string, BigNumber, number, string]>;

    getAttestationExtraData(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<[string]>;

    getAttestationIssuer(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<[string]>;

    getAttestationTimestamp(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<[number]>;

    getAttestationValue(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getAttestationValueBatch(
      collectionIds: BigNumberish[],
      owners: string[],
      overrides?: CallOverrides
    ): Promise<[BigNumber[]]>;

    hasAttestation(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    initialize(
      owner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    isAuthorized(
      issuer: string,
      collectionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    pause(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    paused(overrides?: CallOverrides): Promise<[boolean]>;

    recordAttestations(
      attestations: AttestationStruct[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    unauthorizeRange(
      issuer: string,
      rangeIndex: BigNumberish,
      firstCollectionId: BigNumberish,
      lastCollectionId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    unauthorizeRanges(
      issuer: string,
      ranges: RangeStruct[],
      rangeIndexes: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    unpause(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  authorizeRange(
    issuer: string,
    firstCollectionId: BigNumberish,
    lastCollectionId: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  authorizeRanges(
    issuer: string,
    ranges: RangeStruct[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  deleteAttestations(
    owners: string[],
    collectionIds: BigNumberish[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  getAttestationData(
    collectionId: BigNumberish,
    owner: string,
    overrides?: CallOverrides
  ): Promise<AttestationDataStructOutput>;

  getAttestationDataBatch(
    collectionIds: BigNumberish[],
    owners: string[],
    overrides?: CallOverrides
  ): Promise<AttestationDataStructOutput[]>;

  getAttestationDataTuple(
    collectionId: BigNumberish,
    owner: string,
    overrides?: CallOverrides
  ): Promise<[string, BigNumber, number, string]>;

  getAttestationExtraData(
    collectionId: BigNumberish,
    owner: string,
    overrides?: CallOverrides
  ): Promise<string>;

  getAttestationIssuer(
    collectionId: BigNumberish,
    owner: string,
    overrides?: CallOverrides
  ): Promise<string>;

  getAttestationTimestamp(
    collectionId: BigNumberish,
    owner: string,
    overrides?: CallOverrides
  ): Promise<number>;

  getAttestationValue(
    collectionId: BigNumberish,
    owner: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getAttestationValueBatch(
    collectionIds: BigNumberish[],
    owners: string[],
    overrides?: CallOverrides
  ): Promise<BigNumber[]>;

  hasAttestation(
    collectionId: BigNumberish,
    owner: string,
    overrides?: CallOverrides
  ): Promise<boolean>;

  initialize(
    owner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  isAuthorized(
    issuer: string,
    collectionId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<boolean>;

  owner(overrides?: CallOverrides): Promise<string>;

  pause(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  paused(overrides?: CallOverrides): Promise<boolean>;

  recordAttestations(
    attestations: AttestationStruct[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  renounceOwnership(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  unauthorizeRange(
    issuer: string,
    rangeIndex: BigNumberish,
    firstCollectionId: BigNumberish,
    lastCollectionId: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  unauthorizeRanges(
    issuer: string,
    ranges: RangeStruct[],
    rangeIndexes: BigNumberish[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  unpause(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    authorizeRange(
      issuer: string,
      firstCollectionId: BigNumberish,
      lastCollectionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    authorizeRanges(
      issuer: string,
      ranges: RangeStruct[],
      overrides?: CallOverrides
    ): Promise<void>;

    deleteAttestations(
      owners: string[],
      collectionIds: BigNumberish[],
      overrides?: CallOverrides
    ): Promise<void>;

    getAttestationData(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<AttestationDataStructOutput>;

    getAttestationDataBatch(
      collectionIds: BigNumberish[],
      owners: string[],
      overrides?: CallOverrides
    ): Promise<AttestationDataStructOutput[]>;

    getAttestationDataTuple(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<[string, BigNumber, number, string]>;

    getAttestationExtraData(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<string>;

    getAttestationIssuer(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<string>;

    getAttestationTimestamp(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<number>;

    getAttestationValue(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getAttestationValueBatch(
      collectionIds: BigNumberish[],
      owners: string[],
      overrides?: CallOverrides
    ): Promise<BigNumber[]>;

    hasAttestation(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    initialize(owner: string, overrides?: CallOverrides): Promise<void>;

    isAuthorized(
      issuer: string,
      collectionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    owner(overrides?: CallOverrides): Promise<string>;

    pause(overrides?: CallOverrides): Promise<void>;

    paused(overrides?: CallOverrides): Promise<boolean>;

    recordAttestations(
      attestations: AttestationStruct[],
      overrides?: CallOverrides
    ): Promise<void>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    unauthorizeRange(
      issuer: string,
      rangeIndex: BigNumberish,
      firstCollectionId: BigNumberish,
      lastCollectionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    unauthorizeRanges(
      issuer: string,
      ranges: RangeStruct[],
      rangeIndexes: BigNumberish[],
      overrides?: CallOverrides
    ): Promise<void>;

    unpause(overrides?: CallOverrides): Promise<void>;
  };

  filters: {
    "AttestationDeleted(tuple)"(
      attestation?: null
    ): AttestationDeletedEventFilter;
    AttestationDeleted(attestation?: null): AttestationDeletedEventFilter;

    "AttestationRecorded(tuple)"(
      attestation?: null
    ): AttestationRecordedEventFilter;
    AttestationRecorded(attestation?: null): AttestationRecordedEventFilter;

    "IssuerAuthorized(address,uint256,uint256)"(
      issuer?: null,
      firstCollectionId?: null,
      lastCollectionId?: null
    ): IssuerAuthorizedEventFilter;
    IssuerAuthorized(
      issuer?: null,
      firstCollectionId?: null,
      lastCollectionId?: null
    ): IssuerAuthorizedEventFilter;

    "IssuerUnauthorized(address,uint256,uint256)"(
      issuer?: null,
      firstCollectionId?: null,
      lastCollectionId?: null
    ): IssuerUnauthorizedEventFilter;
    IssuerUnauthorized(
      issuer?: null,
      firstCollectionId?: null,
      lastCollectionId?: null
    ): IssuerUnauthorizedEventFilter;

    "OwnershipTransferred(address,address)"(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;

    "Paused(address)"(account?: null): PausedEventFilter;
    Paused(account?: null): PausedEventFilter;

    "Unpaused(address)"(account?: null): UnpausedEventFilter;
    Unpaused(account?: null): UnpausedEventFilter;
  };

  estimateGas: {
    authorizeRange(
      issuer: string,
      firstCollectionId: BigNumberish,
      lastCollectionId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    authorizeRanges(
      issuer: string,
      ranges: RangeStruct[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    deleteAttestations(
      owners: string[],
      collectionIds: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    getAttestationData(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getAttestationDataBatch(
      collectionIds: BigNumberish[],
      owners: string[],
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getAttestationDataTuple(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getAttestationExtraData(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getAttestationIssuer(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getAttestationTimestamp(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getAttestationValue(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getAttestationValueBatch(
      collectionIds: BigNumberish[],
      owners: string[],
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    hasAttestation(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    initialize(
      owner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    isAuthorized(
      issuer: string,
      collectionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    pause(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    paused(overrides?: CallOverrides): Promise<BigNumber>;

    recordAttestations(
      attestations: AttestationStruct[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    unauthorizeRange(
      issuer: string,
      rangeIndex: BigNumberish,
      firstCollectionId: BigNumberish,
      lastCollectionId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    unauthorizeRanges(
      issuer: string,
      ranges: RangeStruct[],
      rangeIndexes: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    unpause(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    authorizeRange(
      issuer: string,
      firstCollectionId: BigNumberish,
      lastCollectionId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    authorizeRanges(
      issuer: string,
      ranges: RangeStruct[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    deleteAttestations(
      owners: string[],
      collectionIds: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    getAttestationData(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getAttestationDataBatch(
      collectionIds: BigNumberish[],
      owners: string[],
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getAttestationDataTuple(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getAttestationExtraData(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getAttestationIssuer(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getAttestationTimestamp(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getAttestationValue(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getAttestationValueBatch(
      collectionIds: BigNumberish[],
      owners: string[],
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    hasAttestation(
      collectionId: BigNumberish,
      owner: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    initialize(
      owner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    isAuthorized(
      issuer: string,
      collectionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    pause(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    paused(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    recordAttestations(
      attestations: AttestationStruct[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    unauthorizeRange(
      issuer: string,
      rangeIndex: BigNumberish,
      firstCollectionId: BigNumberish,
      lastCollectionId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    unauthorizeRanges(
      issuer: string,
      ranges: RangeStruct[],
      rangeIndexes: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    unpause(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
