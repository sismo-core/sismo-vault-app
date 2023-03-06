import styled from "styled-components";
import Button from "../../../components/Button";

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-bottom: 30px;
`;

const Text = styled.div`
  margin-bottom: 30px;
  color: ${(props) => props.theme.colors.blue0};
`;

type Props = {
  callbackUrl: string;
};

export default function WrongUrlScreen({ callbackUrl }: Props) {
  return (
    <Container>
      <br />
      <Text>It seems that you enter a wrong url</Text>
      {callbackUrl && (
        <Button onClick={() => (window.location.href = callbackUrl)}>
          Go back to {callbackUrl}
        </Button>
      )}
    </Container>
  );
}
