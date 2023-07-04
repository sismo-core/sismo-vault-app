import env from "../../../environment";
import { SismoConnectDataSource } from "../../vault-client";

const SISMO_CONNECT_DATA_SOURCE_CONFIG = env.sismoConnectDataSourcesConfig;

export const isAccountPartOfTheConfig = (
  sismoConnectDataSource: SismoConnectDataSource
): boolean => {
  return Boolean(
    SISMO_CONNECT_DATA_SOURCE_CONFIG.find((el) => el.appId === sismoConnectDataSource.appId)
  );
};
