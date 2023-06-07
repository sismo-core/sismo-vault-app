import { Environment } from "../../environment";
import {
  AWSCommitmentMapper,
  CommitmentMapper,
  ImpersonatedCommitmentMapper,
} from "../commitment-mapper";
import { VaultClient as VaultClientV1 } from "../vault-client-v1";
import { VaultClient, DemoVaultClient } from "../vault-client";
import { AWSStore } from "../vault-store/aws-store";
import { MemoryStore } from "../vault-store/memory-store";
import { VaultsSynchronizer } from "../vaults-synchronizer";
import { ImpersonatedVaultCreator } from "../impersonated-vault-creator";
import { Web2Resolver } from "../web2-resolver";
import { ParseSismoConnectRequest } from "../parse-sismo-connect-request";

// factory service
type Configuration = {
  parseSismoConnectRequest: ParseSismoConnectRequest;
  vaultsSynchronizer: VaultsSynchronizer;
  vaultClientV1: VaultClientV1;
  vaultClient: VaultClient; // V2
  commitmentMapperV1: CommitmentMapper;
  commitmentMapper: CommitmentMapper;
  impersonatedVaultCreator: ImpersonatedVaultCreator;
  web2Resolver: Web2Resolver;
};

export class ServicesFactory {
  private _configuration: Configuration;

  constructor(configuration: Configuration) {
    this._configuration = configuration;
  }

  static init({ env }: { env: Environment }) {
    const parseSismoConnectRequest = new ParseSismoConnectRequest();
    const impersonatedAccounts =
      parseSismoConnectRequest.get()?.vault?.impersonate;
    const isImpersonated = Boolean(impersonatedAccounts?.length > 0);

    if (env.name === "DEMO") {
      const configuration = {
        parseSismoConnectRequest: parseSismoConnectRequest,
        vaultsSynchronizer: null,
        vaultClientV1: null,
        vaultClient: new DemoVaultClient(new MemoryStore()),
        commitmentMapperV1: null,
        commitmentMapper: new AWSCommitmentMapper({
          url: env.commitmentMapperUrlV2,
        }),
        impersonatedVaultCreator: null,
        web2Resolver: new Web2Resolver(),
      };
      return new ServicesFactory(configuration);
    }

    if (isImpersonated) {
      const vaultClient = new VaultClient(new MemoryStore());
      const commitmentMapper = new ImpersonatedCommitmentMapper();
      const web2Resolver = new Web2Resolver();

      const configuration = {
        parseSismoConnectRequest: parseSismoConnectRequest,
        vaultsSynchronizer: null,
        vaultClientV1: null,
        vaultClient: vaultClient,
        commitmentMapperV1: null,
        commitmentMapper: new ImpersonatedCommitmentMapper(),
        impersonatedVaultCreator: new ImpersonatedVaultCreator({
          vaultClient: vaultClient,
          commitmentMapper: commitmentMapper,
          web2Resolver: web2Resolver,
          impersonatedAccounts: impersonatedAccounts,
        }),
        web2Resolver: web2Resolver,
      };
      return new ServicesFactory(configuration);
    }

    const vaultClientV1 = new VaultClientV1(
      new AWSStore({ vaultUrl: env.vaultV1URL })
    );
    const vaultClient = new VaultClient(
      new AWSStore({ vaultUrl: env.vaultV2URL })
    );
    const commitmentMapperV1 = new AWSCommitmentMapper({
      url: env.commitmentMapperUrlV1,
    });
    const commitmentMapper = new AWSCommitmentMapper({
      url: env.commitmentMapperUrlV2,
    });

    const vaultsSynchronizer = new VaultsSynchronizer({
      commitmentMapperV1,
      commitmentMapperV2: commitmentMapper,
      vaultClientV1,
      vaultClientV2: vaultClient,
    });

    const configuration = {
      parseSismoConnectRequest: parseSismoConnectRequest,
      vaultsSynchronizer,
      vaultClientV1,
      vaultClient,
      commitmentMapperV1,
      commitmentMapper,
      impersonatedVaultCreator: null,
      web2Resolver: new Web2Resolver(),
    };

    return new ServicesFactory(configuration);
  }

  public getParseSismoConnectRequest() {
    return this._configuration.parseSismoConnectRequest;
  }

  public getCommitmentMapperV1() {
    return this._configuration.commitmentMapperV1;
  }

  public getCommitmentMapper() {
    return this._configuration.commitmentMapper;
  }

  public getVaultClientV1() {
    return this._configuration.vaultClientV1;
  }

  public getVaultClient() {
    return this._configuration.vaultClient;
  }

  public getVaultsSynchronizer() {
    return this._configuration.vaultsSynchronizer;
  }

  public getImpersonatedVaultCreator() {
    return this._configuration.impersonatedVaultCreator;
  }

  public getWeb2Resolver() {
    return this._configuration.web2Resolver;
  }
}
