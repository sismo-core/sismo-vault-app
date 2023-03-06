import { ReactNode } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  gap: 30px;
  width: 100%;
  @media (max-width: 1450px) {
    flex-direction: column;
  }
`;

const Left = styled.div`
  width: calc(100% - 330px);
  z-index: 10;
  @media (max-width: 1450px) {
    width: 100%;
  }
`;

const LeftFixed = styled.div`
  position: fixed;
  width: inherit;
  height: calc(100vh - 100px - 100px);

  @media (max-width: 1450px) {
    position: relative;
    width: inherit;
    height: 100%;
  }
`;

const Right = styled.div`
  width: calc(100% - 520px);
  min-width: calc(100% - 520px);
  @media (max-width: 1450px) {
    min-width: 100%;
    width: 100%;
  }
`;

type Props = {
  left: ReactNode;
};

export default function MyVaultContainer({ left }: Props) {
  return (
    <Container id="myVaultContent">
      <Left>
        <LeftFixed>{left}</LeftFixed>
      </Left>
    </Container>
  );
}
