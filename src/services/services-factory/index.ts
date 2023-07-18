import { Environment } from "../../environment";
import {
  AWSCommitmentMapper,
  CommitmentMapper,
  ImpersonatedCommitmentMapper,
} from "../commitment-mapper";
import { VaultClient as VaultClientV1 } from "../vault-client-v1";
import { VaultClient } from "../vault-client";
import { AWSStore } from "../../libs/vault-store/aws-store";
import { MemoryStore } from "../../libs/vault-store/memory-store";
import { VaultsSynchronizer } from "../vaults-synchronizer";
import { ImpersonatedVaultCreator } from "../impersonated-vault-creator";
import { AccountResolver } from "../account-resolver";
import { VaultConfigParser } from "../vault-config-parser";
import { SismoConnectProvers } from "../sismo-connect-provers";
import { IndexDbCache } from "../cache-service/indexdb-cache";

// factory service
type Configuration = {
  vaultConfigParser: VaultConfigParser;
  vaultsSynchronizer: VaultsSynchronizer;
  vaultClientV1: VaultClientV1;
  vaultClient: VaultClient; // V2
  commitmentMapperV1: CommitmentMapper;
  commitmentMapper: CommitmentMapper;
  impersonatedVaultCreator: ImpersonatedVaultCreator;
  accountResolver: AccountResolver;
  sismoConnectProvers: SismoConnectProvers;
};

export class ServicesFactory {
  private _configuration: Configuration;

  constructor(configuration: Configuration) {
    this._configuration = configuration;
  }

  static init({ env }: { env: Environment }) {
    const vaultConfigParser = new VaultConfigParser();
    const impersonatedAccounts = vaultConfigParser.get()?.vault?.impersonate;
    const isImpersonated = Boolean(impersonatedAccounts?.length > 0);

    const cache = new IndexDbCache();

    const impersonatedCommitmentMapper = new ImpersonatedCommitmentMapper();
    const commitmentMapper: CommitmentMapper = isImpersonated
      ? impersonatedCommitmentMapper
      : new AWSCommitmentMapper({
          url: env.commitmentMapperUrlV2,
        });
    const vaultClient = new VaultClient(
      isImpersonated ? new MemoryStore() : new AWSStore({ vaultUrl: env.vaultV2URL })
    );

    const commitmentMapperV1 = new AWSCommitmentMapper({
      url: env.commitmentMapperUrlV1,
    });
    const vaultClientV1 = new VaultClientV1(new AWSStore({ vaultUrl: env.vaultV1URL }));

    const accountResolver = new AccountResolver();

    const sismoConnectProvers = new SismoConnectProvers({
      cache: cache,
      commitmentMapperService: commitmentMapper,
    });

    const impersonatedVaultCreator = isImpersonated
      ? new ImpersonatedVaultCreator({
          vaultClient: vaultClient,
          commitmentMapper: impersonatedCommitmentMapper,
          accountResolver: accountResolver,
          impersonatedAccounts: impersonatedAccounts,
        })
      : null;

    const vaultsSynchronizer =
      env.name === "DEMO" || isImpersonated
        ? null
        : new VaultsSynchronizer({
            commitmentMapperV1,
            commitmentMapperV2: commitmentMapper,
            vaultClientV1,
            vaultClientV2: vaultClient,
          });

    const configuration = {
      vaultConfigParser: vaultConfigParser,
      vaultsSynchronizer,
      vaultClientV1,
      vaultClient,
      commitmentMapperV1,
      commitmentMapper,
      impersonatedVaultCreator: impersonatedVaultCreator,
      accountResolver: accountResolver,
      sismoConnectProvers: sismoConnectProvers,
    };

    return new ServicesFactory(configuration);
  }

  public getSismoConnectProvers() {
    return this._configuration.sismoConnectProvers;
  }

  public getVaultConfigParser() {
    return this._configuration.vaultConfigParser;
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

  public getAccountResolver() {
    return this._configuration.accountResolver;
  }
}
