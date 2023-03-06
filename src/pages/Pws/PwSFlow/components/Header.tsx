import styled from "styled-components";
import { getMinimalIdentifier } from "../../../../utils/getMinimalIdentifier";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.div`
  font-size: 21px;
  color: ${(props) => props.theme.colors.blue0};
`;

const Subtitle = styled.div`
  font-size: 11px;
  color: ${(props) => props.theme.colors.blue4};
`;

type Props = {
  name: string;
  destination: string;
};

export default function Header({ name, destination }: Props) {
  return (
    <Container>
      <Title>{name}</Title>
      <Subtitle>mint on {getMinimalIdentifier(destination)}</Subtitle>
    </Container>
  );
}
