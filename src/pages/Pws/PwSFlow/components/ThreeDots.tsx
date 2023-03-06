import styled from "styled-components";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 32px;
`;

const Dot = styled.div<{ size: number }>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  border-radius: 50%;
  background-color: ${(props) => props.theme.colors.blue1};
`;

export default function ThreeDots() {
  return (
    <Container>
      <Dot size={3.33} />
      <Dot size={5} />
      <Dot size={7} />
    </Container>
  );
}
