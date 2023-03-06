import axios from "axios";
import { ethers } from "ethers";
import { getWeb3Provider } from "../../web3-providers";
import { FrontContract } from "../contracts";
import { AttestationsRegistryContract } from "../contracts";
import {
  AttestationsRegistry,
  Front,
  RequestStruct,
} from "../contracts/commons/typechain";
import { Endpoints } from "./endpoints";

export type ApiRequestType = {
  attesterAddresses: string[];
  attestationRequests: RequestStruct[];
  proofBytes: string[];
};

//TODO Refactor this
export class Relayer {
  private endpoints: string[];

  constructor({ endpoints }: { endpoints?: string[] }) {
    if (endpoints) this.endpoints = endpoints;
    else this.endpoints = Endpoints;
  }

  private _getRelayerUrl = () => {
    return this.endpoints[Math.floor(Math.random() * this.endpoints.length)];
  };

  private avoidReplay = async (
    front: Front,
    attestationsRegistry: AttestationsRegistry,
    request: ApiRequestType
  ) => {
    const batchAttestations = await front.batchBuildAttestations(
      request.attesterAddresses,
      request.attestationRequests,
      request.proofBytes
    );
    const attestationsToCreate = batchAttestations.flat() as any;

    const collectionIds = attestationsToCreate.map(
      (attestation) => attestation.collectionId
    );
    const owners = attestationsToCreate.map((attestation) => attestation.owner);

    // retrieve current attestations
    const existingAttestations =
      await attestationsRegistry.getAttestationDataBatch(collectionIds, owners);

    for (let i = 0; i < collectionIds.length; i++) {
      const attestationToCreate = attestationsToCreate[i];
      const existingAttestation = existingAttestations[i];
      if (existingAttestation.issuer !== ethers.constants.AddressZero) {
        if (attestationToCreate.value.gt(existingAttestation.value)) {
          // If the value of the attestation to create is greater than the existing one, we can authorize it
          continue;
        } else {
          throw new Error(
            `Attestation ${attestationToCreate.collectionId} already exists for owner ${attestationToCreate.owner}`
          );
        }
      }
    }
  };

  public createAttestations = async (
    request: ApiRequestType,
    chainId: number
  ) => {
    let apiBaseUrl = this._getRelayerUrl();
    const provider = getWeb3Provider(Number(chainId));
    const front = new FrontContract({ chainId, signerOrProvider: provider });
    const attestationRegistry = new AttestationsRegistryContract({
      chainId,
      signerOrProvider: provider,
    });
    await this.avoidReplay(
      front.getInstance(),
      attestationRegistry.getInstance(),
      request
    );
    const { data } = await axios.post(`${apiBaseUrl}`, request);
    if (data?.status === "error") {
      console.error(data);
      throw new Error("Relayer error");
    }
    return data;
  };
}
