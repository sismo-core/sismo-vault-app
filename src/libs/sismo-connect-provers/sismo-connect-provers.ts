import {
  ClaimRequestEligibility,
  AuthRequestEligibility,
  SismoConnectRequest,
  SismoConnectResponse,
  SelectedSismoConnectRequest,
} from "./sismo-connect-prover-v1";
import { Cache } from "../cache-service";
import { ImportedAccount } from "../vault-client";
import {
  RequestValidationStatus,
  validateSismoConnectRequest,
} from "../../pages/Connect/utils/validate-sismo-connect-request";
import { CommitmentMapper } from "../commitment-mapper";
import { SismoConnectProverV1 } from "./sismo-connect-prover-v1/sismo-connect-prover-v1";

export class SismoConnectProvers {
  private sismoConnectProvers: {
    "sismo-connect-v1": SismoConnectProverV1;
    "sismo-connect-v1.1": SismoConnectProverV1;
  };

  constructor({
    cache,
    commitmentMapperService,
  }: {
    cache: Cache;
    commitmentMapperService: CommitmentMapper;
  }) {
    this.initDevConfig = this.initDevConfig.bind(this);
    this.getRegistryTreeRoot = this.getRegistryTreeRoot.bind(this);
    this.getClaimRequestEligibilities =
      this.getClaimRequestEligibilities.bind(this);
    this.getAuthRequestEligibilities =
      this.getAuthRequestEligibilities.bind(this);
    this.generateResponse = this.generateResponse.bind(this);

    this.sismoConnectProvers = {
      "sismo-connect-v1": new SismoConnectProverV1({
        cache: cache,
        commitmentMapperService,
      }),
      "sismo-connect-v1.1": new SismoConnectProverV1({
        cache: cache,
        commitmentMapperService,
      }),
    };
  }

  private _validateRequest(sismoConnectRequest: SismoConnectRequest) {
    const requestValidation = validateSismoConnectRequest(sismoConnectRequest);
    if (requestValidation.status === RequestValidationStatus.Error)
      throw new Error(requestValidation.message);
  }

  public async initDevConfig(sismoConnectRequest: SismoConnectRequest) {
    this._validateRequest(sismoConnectRequest);

    const sismoConnectProver = this.sismoConnectProvers[
      sismoConnectRequest.version
    ] as SismoConnectProverV1;

    if (sismoConnectRequest?.devConfig?.enabled !== false)
      await sismoConnectProver.initDevConfig(sismoConnectRequest?.devConfig);
  }

  public async getRegistryTreeRoot(
    sismoConnectRequest: SismoConnectRequest
  ): Promise<string> {
    this._validateRequest(sismoConnectRequest);
    const sismoConnectProver = this.sismoConnectProvers[
      sismoConnectRequest.version
    ] as SismoConnectProverV1;

    return await sismoConnectProver.getRegistryTreeRoot();
  }

  public async getClaimRequestEligibilities(
    sismoConnectRequest: SismoConnectRequest,
    importedAccounts: ImportedAccount[]
  ): Promise<ClaimRequestEligibility[]> {
    this._validateRequest(sismoConnectRequest);
    const sismoConnectProver = this.sismoConnectProvers[
      sismoConnectRequest.version
    ] as SismoConnectProverV1;

    return await sismoConnectProver.getClaimRequestEligibilities(
      sismoConnectRequest,
      importedAccounts
    );
  }

  public async getAuthRequestEligibilities(
    sismoConnectRequest: SismoConnectRequest,
    importedAccounts: ImportedAccount[]
  ): Promise<AuthRequestEligibility[]> {
    this._validateRequest(sismoConnectRequest);
    const sismoConnectProver = this.sismoConnectProvers[
      sismoConnectRequest.version
    ] as SismoConnectProverV1;

    return await sismoConnectProver.getAuthRequestEligibilities(
      sismoConnectRequest,
      importedAccounts
    );
  }

  public async generateResponse(
    sismoConnectRequest: SelectedSismoConnectRequest,
    importedAccounts: ImportedAccount[],
    vaultSecret: string
  ): Promise<SismoConnectResponse> {
    this._validateRequest(sismoConnectRequest);
    const sismoConnectProver =
      this.sismoConnectProvers[sismoConnectRequest.version];
    return sismoConnectProver.generateResponse(
      sismoConnectRequest,
      importedAccounts,
      vaultSecret
    );
  }
}
