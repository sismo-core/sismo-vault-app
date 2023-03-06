import AttestationsRegistryABI from "./abis/AttestationsRegistry.json";
import HydraS1SimpleAttesterABI from "./abis/HydraS1SimpleAttester";
import Pythia1SimpleAttesterABI from "./abis/Pythia1SimpleAttester";
import FrontABI from "./abis/Front.json";
import BadgesABI from "./abis/Badges.json";
import AvailableRootsRegistryABI from "./abis/AvailableRootsRegistry.json";
import CommitmentMapperRegistryABI from "./abis/CommitmentMapperRegistry.json";
import HydraAccountboundAttesterABI from "./abis/HydraAccountboundAttester";
import HydraS1VerifierABI from "./abis/HydraS1Verifier.json";
import FrontendLibABI from "./abis/FrontendLib.json";

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
  [SupportedChainName.POLYGON_PLAYGROUND]:
    SupportedChainLabel.POLYGON_PLAYGROUND,
  [SupportedChainName.MUMBAI]: SupportedChainLabel.MUMBAI,
  [SupportedChainName.GNOSIS]: SupportedChainLabel.GNOSIS,
  [SupportedChainName.MAINNET]: SupportedChainLabel.MAINNET,
};

export enum Contracts {
  AttestationsRegistry = "AttestationsRegistry",
  Badges = "Badges",
  HydraS1SimpleAttester = "HydraS1SimpleAttester",
  HydraS1AccountboundAttester = "HydraS1AccountboundAttester",
  Pythia1SimpleAttester = "Pythia1SimpleAttester",
  Front = "Front",
  AvailableRootsRegistry = "AvailableRootsRegistry",
  CommitmentMapperRegistry = "CommitmentMapperRegistry",
  HydraS1Verifier = "HydraS1Verifier",
  FrontendLib = "FrontendLib",
}

export const AttesterRanges = {
  [Contracts.HydraS1SimpleAttester]: [
    {
      first: 20000001,
      last: 30000000,
    },
  ],
  [Contracts.HydraS1AccountboundAttester]: [
    {
      first: 10000001,
      last: 20000000,
    },
  ],
};

export const ContractABIs = {
  [Contracts.AttestationsRegistry]: AttestationsRegistryABI,
  [Contracts.Badges]: BadgesABI,
  [Contracts.HydraS1SimpleAttester]: HydraS1SimpleAttesterABI,
  [Contracts.HydraS1AccountboundAttester]: HydraAccountboundAttesterABI,
  [Contracts.Pythia1SimpleAttester]: Pythia1SimpleAttesterABI,
  [Contracts.Front]: FrontABI,
  [Contracts.AvailableRootsRegistry]: AvailableRootsRegistryABI,
  [Contracts.CommitmentMapperRegistry]: CommitmentMapperRegistryABI,
  [Contracts.HydraS1Verifier]: HydraS1VerifierABI,
  [Contracts.FrontendLib]: FrontendLibABI,
};
