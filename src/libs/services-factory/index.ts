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

// factory service
type Configuration = {
  vaultsSynchronizer: VaultsSynchronizer;
  vaultClientV1: VaultClientV1;
  vaultClient: VaultClient; // V2
  commitmentMapperV1: CommitmentMapper;
  commitmentMapper: CommitmentMapper;
  impersonatedVaultCreator: ImpersonatedVaultCreator;
};

export class ServicesFactory {
  private _configuration: Configuration;

  constructor(configuration: Configuration) {
    this._configuration = configuration;
  }

  static init({
    env,
    isImpersonated,
  }: {
    env: Environment;
    isImpersonated: boolean;
  }) {
    if (env.name === "DEMO") {
      const configuration = {
        vaultsSynchronizer: null,
        vaultClientV1: null,
        vaultClient: new DemoVaultClient(new MemoryStore()),
        commitmentMapperV1: null,
        commitmentMapper: new AWSCommitmentMapper({
          url: env.commitmentMapperUrlV2,
        }),
        impersonatedVaultCreator: null,
      };
      return new ServicesFactory(configuration);
    }

    if (isImpersonated) {
      const vaultClient = new VaultClient(new MemoryStore());
      const commitmentMapper = new ImpersonatedCommitmentMapper();

      const configuration = {
        vaultsSynchronizer: null,
        vaultClientV1: null,
        vaultClient: vaultClient,
        commitmentMapperV1: null,
        commitmentMapper: new ImpersonatedCommitmentMapper(),
        impersonatedVaultCreator: new ImpersonatedVaultCreator({
          vaultClient: vaultClient,
          commitmentMapper: commitmentMapper,
        }),
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
      vaultsSynchronizer,
      vaultClientV1,
      vaultClient,
      commitmentMapperV1,
      commitmentMapper,
      impersonatedVaultCreator: null,
    };

    return new ServicesFactory(configuration);
  }

  public getCommitmentMapperV1() {
    return this._configuration.commitmentMapperV1;
  }

  public getCommitmentMapper() {
    return this._configuration.commitmentMapper;
  }

  public getVaultClientV1() {
    return this._configuration.vaultClientV1;
    // if (!this._configuration.vaultStoreV1) return null;
    // return new VaultClient({ store: this._configuration.vaultStoreV1 });
  }

  public getVaultClient() {
    return this._configuration.vaultClient;
    //	return new VaultClient({ store: this._configuration.vaultStore });
  }

  public getVaultsSynchronizer() {
    return this._configuration.vaultsSynchronizer;
  }

  public getImpersonatedVaultCreator() {
    return this._configuration.impersonatedVaultCreator;
  }
}
