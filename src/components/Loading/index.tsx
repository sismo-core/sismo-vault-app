import styled from "styled-components";
import Loader from "../Loader";
import colors from "../../theme/colors";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingText = styled.div`
  color: ${colors.blue3};
`;

type Props = {
  text: string;
};

export default function Loading({ text }: Props): JSX.Element {
  return (
    <Container>
      <Loader color={colors.blue3} style={{ marginRight: 10 }} />
      <LoadingText>{text}</LoadingText>
    </Container>
  );
}
