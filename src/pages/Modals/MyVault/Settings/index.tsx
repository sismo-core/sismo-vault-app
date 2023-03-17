import styled from "styled-components";
import RecoveryKeys from "./components/RecoveryKeys";
import Customize from "./components/Customize";
import Owners from "./components/Owners";

const Container = styled.div`
  height: calc(100vh - 200px);
  width: 100%;
  display: flex;
  gap: 20px;
  @media (max-width: 1200px) {
    flex-direction: column;
  }
`;

const Left = styled.div`
  flex: 1;
`;

const Right = styled.div`
  flex: 1;
`;

export default function Settings() {
  return (
    <Container>
      <Left>
        <Customize />
        <Owners />
      </Left>
      <Right>
        <RecoveryKeys />
      </Right>
    </Container>
  );
}
