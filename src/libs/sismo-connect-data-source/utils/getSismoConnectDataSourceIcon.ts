import env from "../../../environment";
import { SismoConnectDataSource } from "../../vault-client";

const SISMO_CONNECT_DATA_SOURCE_CONFIG = env.sismoConnectDataSourcesConfig;

type IconName = "worldcoin-outline-white";

export const getSismoConnectDataSourceIcon = (
  sismoConnectDataSource: SismoConnectDataSource
): IconName => {
  const config = SISMO_CONNECT_DATA_SOURCE_CONFIG.find(
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
