import { Initializer } from "./initializer";
import { Provider as AttestationRegistryProvider } from "../provider";
import { Provider } from "@ethersproject/abstract-provider";
import { decodeExtraData } from "../../utils/decodeExtraData";
import { Interface } from "ethers/lib/utils";
import * as Sentry from "@sentry/react";
import { Contract } from "ethers";
import { AttestationsRegistry } from "../../../contracts/commons/typechain";
import areAttestationsDeepEqual from "../../utils/areAttestationsDeepEqual";
import { Attestation } from "../../types";

type AttestationEvent = {
  name: string;
  attestation: Attestation;
};

export type Listener = (attestation: Attestation) => void;

export class OnChainRegistryProvider extends AttestationRegistryProvider {
  private attestations: Attestation[];
  private isInit: boolean = false;
  private initPromise;
  private initializer: Initializer;
  private provider: Provider;
  private logsLimit: number;
  private contract: {
    address: string;
    abi: any;
  };
  private chainId;

  private attestationRecordedListeners: Listener[];

  constructor({
    chainId,
    initializer,
    provider,
    logsLimit,
    contract,
  }: {
    chainId: number;
    initializer: Initializer;
    provider: Provider;
    logsLimit: number;
    contract: {
      address: string;
      abi: any;
    };
  }) {
    super();
    this.chainId = chainId;
    this.initializer = initializer;
    this.provider = provider;
    this.contract = contract;
    this.logsLimit = logsLimit;
  }

  public async init() {
    if (!this.initPromise) {
      this.initPromise = this.initAttestations();
    }
    await this.initPromise;
    this.isInit = true;
  }

  private async initAttestations() {
    let block = 0;
    let attestations = [];
    if (this.initializer) {
      const { block: initialBlock, attestations: initialAttestations } =
        await this.initializer.init();
      block = initialBlock;
      attestations = initialAttestations;
    }
    this.attestations = attestations;
    await this.buildLastBlocksFrom(block);
  }

  public async get(): Promise<Attestation[]> {
    if (!this.isInit) {
      await this.init();
    }
    return this.attestations;
  }

  public onAttestationRecorded = (listener: Listener) => {
    if (!this.attestationRecordedListeners)
      this.attestationRecordedListeners = [];

    const index = this.attestationRecordedListeners.findIndex(
      (el) => el === listener
    );

    if (index === -1) {
      this.attestationRecordedListeners.push(listener);
    } else {
      this.attestationRecordedListeners[index] = listener;
    }
  };

  /*******************************************************************/
  /***************************** UTILS *******************************/
  /*******************************************************************/

  private async buildLastBlocksFrom(fromBlock: number) {
    let retryNumber = 0;
    do {
      try {
        const currentBlock = await this.provider.getBlockNumber();
        if (currentBlock - fromBlock >= 10000) {
          throw new Error("To much block between s3 block and current block");
        }
        if (currentBlock > fromBlock) {
          const pastEvents = await this.getPastEvents(fromBlock, currentBlock);
          for (let pastEvent of pastEvents) {
            //Add attestation if not already added
            const _localAttestationStatus = this.getLocalAttestationStatus(
              pastEvent.attestation
            );
            if (pastEvent.name === "AttestationRecorded") {
              if (_localAttestationStatus.status === "notRecorded") {
                this.attestations.push(pastEvent.attestation);
              }
              if (_localAttestationStatus.status === "updated") {
                this.attestations[_localAttestationStatus.index] =
                  pastEvent.attestation;
              }
            }
            //TODO: Add attestation if not already added
            if (pastEvent.name === "AttestationDeleted") {
              const index = this.attestations.findIndex(
                (attestation) =>
                  attestation.collectionId ===
                    pastEvent.attestation.collectionId &&
                  attestation.owner.toLowerCase() ===
                    pastEvent.attestation.owner.toLowerCase()
              );
              if (index !== -1) {
                this.attestations.splice(index, 1);
              }
            }
          }
        }
        return;
      } catch (e) {
        Sentry.captureException(e);
        console.error(e);
      }
      console.log("Retry in 2 secs");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      retryNumber++;
    } while (retryNumber < 5);
  }

  private getPastEvents = async (
    from: number,
    to: number
  ): Promise<AttestationEvent[]> => {
    const contractAddress = this.contract.address;
    const contractAbi = this.contract.abi;
    const iface = new Interface(contractAbi);
    let logs = [];
    if (from <= to) {
      const nbPages = Math.ceil((to - from) / this.logsLimit);
      if (nbPages > 30) {
        Sentry.captureMessage(
          `Subgraph out to date of ${
            to - from
          } blocks {currentBlock: ${from}, subgraphBlock: ${to}}`
        );
      }
      for (let page = 1; page <= nbPages; page++) {
        const fromBlock: number = to - page * this.logsLimit;
        const criteria = {
          address: contractAddress,
          fromBlock: fromBlock < 0 ? 0 : fromBlock,
          toBlock: to - (page - 1) * this.logsLimit,
        };
        const res = await this.provider.getLogs(criteria);
        logs.push(res);
      }
    }
    logs = logs.flat();

    const decoded = logs.map((log) => {
      try {
        const res = iface.parseLog({
          topics: log.topics,
          data: log.data,
        }).args as any;
        if (!res.attestation) return null;
        const event = iface.getEvent(log.topics[0]);
        const attestation: Attestation = {
          collectionId: res.attestation.collectionId.toNumber(),
          issuer: res.attestation.issuer,
          owner: res.attestation.owner.toLowerCase(),
          timestamp: res.attestation.timestamp,
          value: res.attestation.value.toString(),
          extraData: decodeExtraData(res.attestation.extraData),
        };
        return {
          name: event.name,
          attestation,
        };
      } catch (e) {
        // console.error(e);
        return null;
      }
    });

    return decoded.filter((el) => el);
  };

  public async startListen() {
    const contract = new Contract(
      this.contract.address,
      this.contract.abi,
      this.provider
    ) as AttestationsRegistry;
    const filters = contract.filters.AttestationRecorded();
    const iface = new Interface(this.contract.abi);
    if (this.provider.listenerCount() === 0) {
      this.provider.on(filters, (log) => {
        const res = iface.parseLog({
          topics: log.topics,
          data: log.data,
        }).args as any;
        const event = iface.getEvent(log.topics[0]);
        if (event.name === "AttestationRecorded") {
          const attestation: Attestation = {
            collectionId: res.attestation.collectionId.toNumber(),
            issuer: res.attestation.issuer,
            owner: res.attestation.owner.toLowerCase(),
            timestamp: res.attestation.timestamp,
            value: res.attestation.value.toString(),
            extraData: decodeExtraData(res.attestation.extraData),
          };

          const localAttestation = this.getLocalAttestationStatus(attestation);

          if (localAttestation.status === "notRecorded") {
            this.attestations.push(attestation);
          }
          if (localAttestation.status === "updated") {
            this.attestations[localAttestation.index] = attestation;
          }

          if (localAttestation.status !== "alreadyRecorded") {
            if (this.attestationRecordedListeners) {
              for (let attestationRecordedListener of this
                .attestationRecordedListeners) {
                attestationRecordedListener(attestation);
              }
            }
          }
        }
        if (event.name === "AttestationDeleted") {
          const index = this.attestations.findIndex(
            (attestation) =>
              attestation.collectionId === res.attestation.collectionId &&
              attestation.owner.toLowerCase() ===
                res.attestation.owner.toLowerCase()
          );
          if (index !== -1) {
            this.attestations.splice(index, 1);
          }
        }
      });
    }
  }

  public async stopListen() {
    const contract = new Contract(
      this.contract.address,
      this.contract.abi,
      this.provider
    ) as AttestationsRegistry;
    const filters = contract.filters.AttestationRecorded();
    this.provider.off(filters);
  }

  private getLocalAttestationStatus(_attestation: Attestation): {
    index: number;
    status: "notRecorded" | "alreadyRecorded" | "updated";
  } {
    const index = this.attestations.findIndex(
      (attestation) =>
        attestation.collectionId === _attestation.collectionId &&
        attestation.owner.toLowerCase() === _attestation.owner.toLowerCase()
    );

    if (index === -1) {
      return {
        index,
        status: "notRecorded",
      };
    }

    if (!areAttestationsDeepEqual(this.attestations[index], _attestation)) {
      return {
        index,
        status: "updated",
      };
    }

    return {
      index,
      status: "alreadyRecorded",
    };
  }
}
