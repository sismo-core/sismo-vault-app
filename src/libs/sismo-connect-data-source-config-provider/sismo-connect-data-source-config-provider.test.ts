import { SismoConnectDataSourceConfig } from "../../environment";
import { SismoConnectDataSource } from "../vault-client";
import { SismoConnectDataSourceConfigProvider } from "./sismo-connect-data-source-config-provider";

describe("SismoConnectDataSourceConfigProvider", () => {
  let sismoConnectDataSourceConfigProvider: SismoConnectDataSourceConfigProvider;
  let sismoConnectDataSourcesConfig: SismoConnectDataSourceConfig[];
  let sismoConnectDataSource: SismoConnectDataSource;

  beforeEach(() => {
    sismoConnectDataSourcesConfig = [
      {
        appId: "123",
        type: "worldcoin",
        name: "World ID",
        request: {
          auths: [
            {
              authType: 0,
            },
          ],
          callbackUrl: "callback-url",
        },
        groupId: "456",
      },
    ];
    sismoConnectDataSource = {
      appId: "0x1",
      vaultId: "0x2",
      createdAt: 1,
    };
    sismoConnectDataSourceConfigProvider = new SismoConnectDataSourceConfigProvider({
      sismoConnectDataSourcesConfig,
    });
  });

  it("should return the config", () => {
    expect(sismoConnectDataSourceConfigProvider.getConfigs()).toBe(sismoConnectDataSourcesConfig);
  });

  it("should return correct groupId", () => {
    sismoConnectDataSource.appId = "123";
    expect(
      sismoConnectDataSourceConfigProvider.getSismoConnectDataSourceGroupId(sismoConnectDataSource)
    ).toBe("456");
  });

  it("should return null if dataSource not found in config", () => {
    sismoConnectDataSource.appId = "999";
    expect(
      sismoConnectDataSourceConfigProvider.getSismoConnectDataSourceGroupId(sismoConnectDataSource)
    ).toBe(null);
  });

  it("should return correct icon", () => {
    sismoConnectDataSource.appId = "123";
    expect(
      sismoConnectDataSourceConfigProvider.getSismoConnectDataSourceIcon(sismoConnectDataSource)
    ).toBe("worldcoin-outline-white");
  });

  it("should return null for icon if dataSource not found in config", () => {
    sismoConnectDataSource.appId = "999";
    expect(
      sismoConnectDataSourceConfigProvider.getSismoConnectDataSourceIcon(sismoConnectDataSource)
    ).toBe(null);
  });

  it("should return null for icon if dataSource type is not worldcoin", () => {
    sismoConnectDataSource.appId = "123";
    sismoConnectDataSourcesConfig[0].type = "not-worldcoin";
    sismoConnectDataSourceConfigProvider = new SismoConnectDataSourceConfigProvider({
      sismoConnectDataSourcesConfig,
    });
    expect(
      sismoConnectDataSourceConfigProvider.getSismoConnectDataSourceIcon(sismoConnectDataSource)
    ).toBe(null);
  });

  it("should return true if account is part of the config", () => {
    sismoConnectDataSource.appId = "123";
    expect(
      sismoConnectDataSourceConfigProvider.isDataSourcePartOfTheConfig(sismoConnectDataSource)
    ).toBe(true);
  });

  it("should return false if account is not part of the config", () => {
    sismoConnectDataSource.appId = "999";
    expect(
      sismoConnectDataSourceConfigProvider.isDataSourcePartOfTheConfig(sismoConnectDataSource)
    ).toBe(false);
  });
});
