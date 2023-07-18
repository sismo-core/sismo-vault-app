import styled from "styled-components";
import colors from "../../theme/colors";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 11px;
`;

const Circle = styled.div<{ color: string }>`
  background-color: ${(props) => props.color};
  width: 4.45px;
  height: 4.45px;

  border-radius: 50%;

  &:nth-child(1) {
    animation: 1.2s ease-in-out 0s infinite normal none running bounce;
  }

  &:nth-child(2) {
    animation: 1.2s ease-in-out 0.4s infinite normal none running bounce;
  }

  &:nth-child(3) {
    animation: 1.2s ease-in-out 0.8s infinite normal none running bounce;
  }

  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: scale(1);
    }
    40% {
      transform: scale(1.5);
    }
  }
`;

type Props = {
  color?: string;
  size?: number;
};

export default function ThreeDotsLoader({ color = colors.blue1, size }: Props): JSX.Element {
  return (
    <Container>
      <Circle color={color} />
      <Circle color={color} />
      <Circle color={color} />
    </Container>
  );
}
