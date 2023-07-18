import styled from "styled-components";
import { ChainIdToLabel, SupportedChainId } from "../../services/sismo-client";
import HoverTooltip from "../HoverTooltip";
import Icon from "../Icon";

const Container = styled.div``;

const Logo = styled.div``;

type ChainsLogoProps = {
  style?: React.CSSProperties;
  chainIds: SupportedChainId[];
};

export default function ChainsLogo({ chainIds }: ChainsLogoProps): JSX.Element {
  return (
    <Container>
      {chainIds &&
        chainIds.map((chainId) => (
          <Logo key={"chain" + chainId}>
            <HoverTooltip text={ChainIdToLabel[chainId]}>
              {chainId < 6 && (
                <>
                  <Icon name="logoEthereum-fill-lightBlue" />
                </>
              )}
              {chainId === 137 ||
                (chainId === 80001 && (
                  <>
                    <Icon name="logoPolygon-fill-white" />
                  </>
                ))}
            </HoverTooltip>
          </Logo>
        ))}
    </Container>
  );
}
