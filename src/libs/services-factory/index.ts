import { Environment } from "../../environment";
import {
  AWSCommitmentMapper,
  CommitmentMapper,
  ImpersonateCommitmentMapper,
} from "../commitment-mapper";

// factory service
type Configuration = {
  // vaultV1Store: VaultStore;
  // vaultStore: VaultStore; // V2
  commitmentMapperV1: CommitmentMapper;
  commitmentMapper: CommitmentMapper;
};

export class ServicesFactory {
  private _configuration: Configuration;

  constructor(configuration: Configuration) {
    this._configuration = configuration;
  }

  static init(env: Environment, impersonateMode: boolean) {
    if (env.name === "DEMO") {
      return new ServicesFactory({
        // vaultV1Store: null,
        // vaultStore: new AwsVaultStore({ vaultUrl: env.vaultV2Url }),
        commitmentMapperV1: null,
        commitmentMapper: new AWSCommitmentMapper({
          url: env.commitmentMapperUrlV2,
        }),
      });
    }

    if (impersonateMode) {
      return new ServicesFactory({
        // vaultV1Store: null,
        // vaultStore: new InMemoryVaultStore(),
        commitmentMapperV1: null,
        commitmentMapper: new ImpersonateCommitmentMapper(),
      });
    }

    return new ServicesFactory({
      // vaultV1Store: new AwsVaultStore({ vaultUrl: env.vaultV1Url });
      // vaultStore: new AwsVaultStore({ vaultUrl: env.vaultV2Url });
      commitmentMapperV1: new AWSCommitmentMapper({
        url: env.commitmentMapperUrlV1,
      }),
      commitmentMapper: new AWSCommitmentMapper({
        url: env.commitmentMapperUrlV2,
      }),
    });
  }

  public getCommitmentMapperV1() {
    return this._configuration.commitmentMapperV1;
  }

  public getCommitmentMapper() {
    return this._configuration.commitmentMapper;
  }

  public getVaultV1() {
    // if (!this._configuration.vaultStoreV1) return null;
    // return new VaultClient({ store: this._configuration.vaultStoreV1 });
  }

  public getVault() {
    //	return new VaultClient({ store: this._configuration.vaultStore });
  }
}
