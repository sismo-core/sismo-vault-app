import styled from "styled-components";
import Icon from "../../../../../components/Icon";
import { Badge, ChainIdToName } from "../../../../../libs/sismo-client";
import { ArrowSquareOut } from "phosphor-react";
import colors from "../../../../../theme/colors";
import Logo, { LogoType } from "../../../../../components/Logo";
import env from "../../../../../environment";

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
`;

const Link = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  color: ${colors.blue0};
`;

const LinkText = styled.div`
  font-family: "Inter-Medium";
  font-size: 14px;
  line-height: 20px;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: flex-start;
  width: 12px;
  height: 12px;
  align-self: flex-start;

  @media (max-width: 900px) {
    width: 10px;
    height: 10px;
  }
`;

type Props = {
  badge: Badge;
  chainId: number;
};

export default function Links({ badge, chainId }: Props): JSX.Element {
  if (!badge) return <></>;

  return (
    <Container>
      {badge.links &&
        badge.links.map(
          (link) =>
            link.label && (
              <Link
                onClick={() => window.open(link.url, "_blank")}
                key={link.url}
              >
                <LinkText>{link.label}</LinkText>
                <ArrowSquareOut
                  size={12}
                  weight={"bold"}
                  style={{ alignSelf: "flex-start" }}
                />
              </Link>
            )
        )}

      {chainId === 137 && (
        <>
          {badge?.stats?.totalHoldersByChain[ChainIdToName[137]] > 0 && (
            <Link
              onClick={() =>
                window.open(
                  `https://opensea.io/assets/matic/${env.contracts[chainId]["Badges"].address}/${badge.collectionId}`,
                  "_blank"
                )
              }
            >
              <Icon name="logoOpensea-fill-color" style={{ width: 14 }} />
              <LinkText>Opensea</LinkText>
              <IconContainer>
                <ArrowSquareOut size={"100%"} weight={"bold"} />
              </IconContainer>
            </Link>
          )}
          <Link
            onClick={() =>
              window.open(
                `https://polygonscan.com/token/${env.contracts[chainId]["Badges"].address}?a=${badge.collectionId}#inventory`,
                "_blank"
              )
            }
          >
            <Icon
              name="logoPolygon-fill-color"
              style={{
                width: 14,
              }}
            />
            <LinkText>Polygonscan</LinkText>
            <IconContainer>
              <ArrowSquareOut size={"100%"} weight={"bold"} />
            </IconContainer>
          </Link>
        </>
      )}

      {chainId === 80001 && (
        <>
          {badge?.stats?.totalHoldersByChain[ChainIdToName[80001]] > 0 && (
            <Link
              onClick={() =>
                window.open(
                  `https://testnets.opensea.io/assets/mumbai/${env.contracts[chainId]["Badges"].address}/${badge.collectionId}`,
                  "_blank"
                )
              }
            >
              <Icon name="logoOpensea-fill-color" style={{ width: 14 }} />
              <LinkText>Opensea</LinkText>
              <IconContainer>
                <ArrowSquareOut size={"100%"} weight={"bold"} />
              </IconContainer>
            </Link>
          )}

          <Link
            onClick={() =>
              window.open(
                `https://mumbai.polygonscan.com/token/${env.contracts[chainId]["Badges"].address}?a=${badge.collectionId}#inventory`,
                "_blank"
              )
            }
          >
            <Icon
              name="logoPolygon-fill-color"
              style={{
                width: 14,
              }}
            />
            <LinkText>Polygonscan</LinkText>
            <IconContainer>
              <ArrowSquareOut size={"100%"} weight={"bold"} />
            </IconContainer>
          </Link>
        </>
      )}

      {chainId === 100 && (
        <>
          {badge?.stats?.totalHoldersByChain[ChainIdToName[100]] > 0 && (
            <Link
              onClick={() =>
                window.open(
                  `https://blockscout.com/xdai/mainnet/token/${env.contracts[chainId]["Badges"].address}/instance/${badge.collectionId}/token-transfers`,
                  "_blank"
                )
              }
            >
              <Logo type={LogoType.GNOSIS} size={14} />
              <LinkText>Blockscout</LinkText>
              <IconContainer>
                <ArrowSquareOut size={"100%"} weight={"bold"} />
              </IconContainer>
            </Link>
          )}

          <Link
            onClick={() =>
              window.open(
                `https://gnosisscan.io/token/${env.contracts[chainId]["Badges"].address}?a=${badge.collectionId}#inventory`,
                "_blank"
              )
            }
          >
            <Logo type={LogoType.GNOSIS} size={14} />
            <LinkText>Gnosisscan</LinkText>
            <IconContainer>
              <ArrowSquareOut size={"100%"} weight={"bold"} />
            </IconContainer>
          </Link>
        </>
      )}

      {chainId === 5 && (
        <>
          {badge?.stats?.totalHoldersByChain[ChainIdToName[5]] > 0 && (
            <Link
              onClick={() =>
                window.open(
                  `https://testnets.opensea.io/assets/goerli/${env.contracts[chainId]["Badges"].address}/${badge.collectionId}`,
                  "_blank"
                )
              }
            >
              <Icon name="logoOpensea-fill-color" style={{ width: 14 }} />
              <LinkText>Opensea</LinkText>
              <IconContainer>
                <ArrowSquareOut size={"100%"} weight={"bold"} />
              </IconContainer>
            </Link>
          )}
          <Link
            onClick={() =>
              window.open(
                `https://goerli.etherscan.io/token/${env.contracts[chainId]["Badges"].address}?a=${badge.collectionId}#inventory`,
                "_blank"
              )
            }
          >
            <Icon name="logoEtherscan-fill-white" style={{ width: 14 }} />
            <LinkText>Etherscan</LinkText>
            <IconContainer>
              <ArrowSquareOut size={"100%"} weight={"bold"} />
            </IconContainer>
          </Link>
        </>
      )}
    </Container>
  );
}
