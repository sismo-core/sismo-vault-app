import colors from "../../theme/colors";

import AvalancheLogo from "./components/AvalancheLogo";
import BadgeLogo from "./components/BadgeLogo";
import DiscordLogo from "./components/DiscordLogo";
import DiscordSquaredLogo from "./components/DiscordSquaredLogo";
import EthereumLogo from "./components/EthereumLogo";
import GitbookLogo from "./components/GitbookLogo";
import GithubRoundedLogo from "./components/GithubRoundedLogo";
import GnosisLogo from "./components/GnosisLogo";
import PolygonLogo from "./components/PolygonLogo";
import TwitterLogo from "./components/TwitterLogo";
import TwitterRoundedLogo from "./components/TwitterRoundedLogo";
import ProofLogo from "./components/ProofLogo";
import VaultOnboardingLogo from "./components/VaultOnboardingLogo";

export enum LogoType {
  AVALANCHE = "AVALANCHE",
  BADGE = "BADGE",
  DISCORD = "DISCORD",
  DISCORD_SQUARED = "DISCORD_SQUARED",
  ETHEREUM = "ethereum",
  GITBOOK = "GITBOOK",
  GITHUB_ROUNDED = "GITHUB_ROUNDED",
  GNOSIS = "gnosis",
  GOERLI = "goerli",
  MUMBAI = "mumbai",
  POLYGON = "polygon",
  PROOF = "PROOF",
  TWITTER = "TWITTER",
  TWITTER_ROUNDED = "TWITTER_ROUNDED",
  VAULTONBOARDING = "VAULTONBOARDING",
}

type Props = {
  size?: number;
  color?: string;
  secondaryColor?: string;
  style?: React.CSSProperties;
  type: LogoType;
  className?: string;
};

export default function Logo({
  size = 32,
  color = colors.blue0,
  secondaryColor = colors.blue11,
  style,
  type,
  className,
}: Props): JSX.Element {
  switch (type) {
    case LogoType.AVALANCHE:
      return <AvalancheLogo size={size} color={color} style={style} className={className} />;

    case LogoType.BADGE:
      return <BadgeLogo size={size} color={color} style={style} className={className} />;

    case LogoType.DISCORD:
      return <DiscordLogo size={size} color={color} style={style} className={className} />;

    case LogoType.DISCORD_SQUARED:
      return <DiscordSquaredLogo size={size} color={color} style={style} className={className} />;

    case LogoType.ETHEREUM:
      return <EthereumLogo size={size} color={color} style={style} className={className} />;

    case LogoType.GITBOOK:
      return <GitbookLogo size={size} color={color} style={style} className={className} />;

    case LogoType.GITHUB_ROUNDED:
      return <GithubRoundedLogo size={size} color={color} style={style} className={className} />;

    case LogoType.GOERLI:
      return <EthereumLogo size={size} color={color} style={style} className={className} />;

    case LogoType.GNOSIS:
      return <GnosisLogo size={size} color={color} style={style} className={className} />;

    case LogoType.PROOF:
      return <ProofLogo size={size} color={color} style={style} className={className} />;

    case LogoType.MUMBAI:
      return <PolygonLogo size={size} color={color} style={style} className={className} />;

    case LogoType.POLYGON:
      return <PolygonLogo size={size} color={color} style={style} className={className} />;

    case LogoType.TWITTER:
      return <TwitterLogo size={size} color={color} style={style} className={className} />;

    case LogoType.TWITTER_ROUNDED:
      return (
        <TwitterRoundedLogo
          size={size}
          color={color}
          secondaryColor={secondaryColor}
          style={style}
        />
      );

    case LogoType.VAULTONBOARDING:
      return (
        <VaultOnboardingLogo
          size={size}
          color={color}
          secondaryColor={secondaryColor}
          style={style}
          className={className}
        />
      );

    default:
      return null;
  }
}
