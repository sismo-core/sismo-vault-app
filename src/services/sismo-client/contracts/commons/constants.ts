export enum SupportedChainId {
  LOCAL = 31337,
  MUMBAI = 80001,
  GORLI = 5,
  MAINNET = 1,
  POLYGON = 137,
  GNOSIS = 100,
  POLYGON_PLAYGROUND = 137,
}

export enum SupportedChainName {
  LOCAL = "local",
  GORLI = "goerli",
  POLYGON = "polygon",
  MAINNET = "mainnet",
  GNOSIS = "gnosis",
  MUMBAI = "mumbai",
  POLYGON_PLAYGROUND = "polygon-playground",
}

export enum SupportedChainLabel {
  LOCAL = "Local",
  GORLI = "Goerli",
  MUMBAI = "Mumbai",
  POLYGON = "Polygon",
  MAINNET = "Ethereum",
  GNOSIS = "Gnosis",
  POLYGON_PLAYGROUND = "polygon",
}

export const ChainIdToLabel = {
  [SupportedChainId.LOCAL]: SupportedChainLabel.LOCAL,
  [SupportedChainId.GORLI]: SupportedChainLabel.GORLI,
  [SupportedChainId.POLYGON]: SupportedChainLabel.POLYGON,
  [SupportedChainId.MUMBAI]: SupportedChainLabel.MUMBAI,
  [SupportedChainId.GNOSIS]: SupportedChainLabel.GNOSIS,
  [SupportedChainId.MAINNET]: SupportedChainLabel.MAINNET,
};

export const ChainIdToName = {
  [SupportedChainId.LOCAL]: SupportedChainName.LOCAL,
  [SupportedChainId.GORLI]: SupportedChainName.GORLI,
  [SupportedChainId.POLYGON]: SupportedChainName.POLYGON,
  [SupportedChainId.MUMBAI]: SupportedChainName.MUMBAI,
  [SupportedChainId.GNOSIS]: SupportedChainName.GNOSIS,
  [SupportedChainId.MAINNET]: SupportedChainName.MAINNET,
};

export const ChainNameToId = {
  [SupportedChainName.LOCAL]: SupportedChainId.LOCAL,
  [SupportedChainName.GORLI]: SupportedChainId.GORLI,
  [SupportedChainName.POLYGON]: SupportedChainId.POLYGON,
  [SupportedChainName.POLYGON_PLAYGROUND]: SupportedChainId.POLYGON_PLAYGROUND,
  [SupportedChainName.MUMBAI]: SupportedChainId.MUMBAI,
  [SupportedChainName.GNOSIS]: SupportedChainId.GNOSIS,
  [SupportedChainName.MAINNET]: SupportedChainId.MAINNET,
};

export const ChainNameToLabel = {
  [SupportedChainName.LOCAL]: SupportedChainLabel.LOCAL,
  [SupportedChainName.GORLI]: SupportedChainLabel.GORLI,
  [SupportedChainName.POLYGON]: SupportedChainLabel.POLYGON,
  [SupportedChainName.POLYGON_PLAYGROUND]: SupportedChainLabel.POLYGON_PLAYGROUND,
  [SupportedChainName.MUMBAI]: SupportedChainLabel.MUMBAI,
  [SupportedChainName.GNOSIS]: SupportedChainLabel.GNOSIS,
  [SupportedChainName.MAINNET]: SupportedChainLabel.MAINNET,
};
