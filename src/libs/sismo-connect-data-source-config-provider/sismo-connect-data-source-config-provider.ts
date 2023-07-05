import { SismoConnectDataSource } from "../vault-client";
import { SismoConnectDataSourceConfig } from "../../environment";

type IconName = "worldcoin-outline-white";

export class SismoConnectDataSourceConfigProvider {
  private _sismoConnectDataSourcesConfig: SismoConnectDataSourceConfig[];

  constructor({
    sismoConnectDataSourcesConfig,
  }: {
    sismoConnectDataSourcesConfig: SismoConnectDataSourceConfig[];
  }) {
    this._sismoConnectDataSourcesConfig = sismoConnectDataSourcesConfig;
  }

  public getConfigs(): SismoConnectDataSourceConfig[] {
    return this._sismoConnectDataSourcesConfig;
  }

  public getConfig(sismoConnectDataSource: SismoConnectDataSource): SismoConnectDataSourceConfig {
    return this._sismoConnectDataSourcesConfig.find(
      (el) => el.appId === sismoConnectDataSource.appId
    );
  }

  public getSismoConnectDataSourceGroupId(sismoConnectDataSource: SismoConnectDataSource): string {
    const config = this.getConfig(sismoConnectDataSource);
    if (!config) return null;
    return config.groupId;
  }

  public getSismoConnectDataSourceIcon = (
    sismoConnectDataSource: SismoConnectDataSource
  ): IconName => {
    const config = this._sismoConnectDataSourcesConfig.find(
      (el) => el.appId === sismoConnectDataSource.appId
    );
    if (!config) return null;
    switch (config.type) {
      case "worldcoin":
        return "worldcoin-outline-white";
      default:
        return null;
    }
  };

  public isDataSourcePartOfTheConfig = (
    sismoConnectDataSource: SismoConnectDataSource
  ): boolean => {
    return Boolean(
      this._sismoConnectDataSourcesConfig.find((el) => el.appId === sismoConnectDataSource.appId)
    );
  };
}
