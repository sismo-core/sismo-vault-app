import styled from "styled-components";
import Button from "../../../../components/Button";
import colors from "../../../../theme/colors";
import Logo, { LogoType } from "../../../../components/Logo";
import { ArrowSquareOut } from "phosphor-react";

const Container = styled.div`
  width: 400px;
  height: 450px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 30px;
  box-sizing: border-box;
  color: ${(props) => props.theme.colors.blue0};

  @media (max-width: 800px) {
    width: 315px;
  }
`;

const Top = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.div`
  align-self: flex-start;
  font-size: 20px;
  line-height: 30px;

  margin-bottom: 60px;
  font-family: ${(props) => props.theme.fonts.medium};

  @media (max-width: 800px) {
    margin-bottom: 40px;
  }
`;

const WhatIsVault = styled.a`
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  line-height: 18px;

  color: inherit;
  text-decoration: none;

  margin-top: 20px;
`;

const ArrowSquareOutWrapper = styled.div`
  align-self: flex-start;
  display: flex;
  align-items: flex-start;
`;

const Bottom = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

type Props = {
  onConnect: () => void;
  onCreateVault: () => void;
};

export default function AccessOrCreateStep({
  onConnect,
  onCreateVault,
}: Props): JSX.Element {
  return (
    <Container>
      <Top>
        <Title>Access or create your Sismo Vault</Title>
        <Logo
          type={LogoType.VAULTONBOARDING}
          color={colors.blue0}
          secondaryColor={colors.blue11}
          size={115}
        />
        <WhatIsVault
          href="https://docs.sismo.io/sismo-docs/what-is-sismo/sismo-vault"
          target="_blank"
          rel="noreferrer"
        >
          What is a Sismo Vault
          <ArrowSquareOutWrapper>
            <ArrowSquareOut size={12.31} weight={"bold"} />
          </ArrowSquareOutWrapper>
        </WhatIsVault>
      </Top>
      <Bottom>
        <Button
          style={{
            marginBottom: 10,
            width: 252,
          }}
          onClick={() => onConnect()}
          primary
        >
          Connect to your Vault
        </Button>
        <Button
          style={{
            width: 252,
          }}
          onClick={() => onCreateVault()}
        >
          Create a Sismo Vault
        </Button>
      </Bottom>
    </Container>
  );
}
