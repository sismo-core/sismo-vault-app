import styled from "styled-components";
import Button from "../../../components/Button";

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-bottom: 30px;
`;

const Text = styled.div`
  color: ${(props) => props.theme.colors.blue0};
`;

const ErrorBlock = styled.div`
  margin-top: 30px;
  max-width: 700px;
  padding: 20px;
  border-radius: 5px;
  background-color: ${(props) => props.theme.colors.blue9};
  color: white;
`;

type Props = {
  callbackUrl: string;
  isWrongUrl: {
    status: boolean;
    message: string;
  };
};

export default function WrongUrlScreen({ callbackUrl, isWrongUrl }: Props) {
  return (
    <Container>
      <ErrorBlock>
        <Text style={{ marginBottom: 20 }}>It seems that you entered a wrong url</Text>
        <Text style={{ marginBottom: 10 }}>Error message:</Text>
        <Text>{isWrongUrl.message}</Text>
      </ErrorBlock>
      <br />
      {callbackUrl && (
        <Button onClick={() => (window.location.href = callbackUrl)}>
          Go back to {callbackUrl}
        </Button>
      )}
    </Container>
  );
}
