import { Environment } from "../../environment";
import {
  AWSCommitmentMapper,
  CommitmentMapper,
  ImpersonateCommitmentMapper,
} from "../commitment-mapper";
import { VaultClient as VaultClientV1 } from "../vault-client-v1";
import { VaultClient } from "../vault-client-v2";
import { AWSStore } from "../vault-store/aws-store";
import { MemoryStore } from "../vault-store/memory-store";

// factory service
type Configuration = {
  vaultClientV1: VaultClientV1;
  vaultClient: VaultClient; // V2
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
        vaultClientV1: null,
        vaultClient: new VaultClient(
          new AWSStore({ vaultUrl: env.vaultV2URL })
        ),
        commitmentMapperV1: null,
        commitmentMapper: new AWSCommitmentMapper({
          url: env.commitmentMapperUrlV2,
        }),
      });
    }

    if (impersonateMode) {
      return new ServicesFactory({
        vaultClientV1: null,
        vaultClient: new VaultClient(new MemoryStore()),
        commitmentMapperV1: null,
        commitmentMapper: new ImpersonateCommitmentMapper(),
      });
    }

    return new ServicesFactory({
      vaultClientV1: new VaultClientV1(
        new AWSStore({ vaultUrl: env.vaultV1URL })
      ),
      vaultClient: new VaultClient(new AWSStore({ vaultUrl: env.vaultV2URL })),
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

  public getVaultClientV1() {
    return this._configuration.vaultClientV1;
    // if (!this._configuration.vaultStoreV1) return null;
    // return new VaultClient({ store: this._configuration.vaultStoreV1 });
  }

  public getVaultClient() {
    return this._configuration.vaultClient;
    //	return new VaultClient({ store: this._configuration.vaultStore });
  }
}
