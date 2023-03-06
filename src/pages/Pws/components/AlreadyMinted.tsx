import styled from "styled-components";
import Button from "../../../components/Button";

const Container = styled.div``;

type Props = {
  callbackUrl: string;
};

export default function AlreadyMinted({ callbackUrl }: Props) {
  return (
    <Container>
      Already minted
      {callbackUrl && (
        <Button onClick={() => (window.location.href = callbackUrl)}>
          Go back to {callbackUrl}
        </Button>
      )}
    </Container>
  );
}
