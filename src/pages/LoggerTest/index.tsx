import styled from "styled-components";
import { useLogger } from "../../hooks/logger";
import Button from "../../components/Button";
import axios from "axios";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
`;

export default function LoggerTest(): JSX.Element {
  const logger = useLogger();

  return (
    <Container>
      <h1>Logger Test</h1>
      <h2>Info</h2>
      <Button
        onClick={() => {
          logger.info("test", 1);
        }}
      >
        Test
      </Button>
      <h2>Error</h2>
      <Button
        onClick={() => {
          logger.error({
            error: new Error("test sentry error"),
            sourceId: "test-error-1",
          });
        }}
      >
        Test
      </Button>
      <Button
        onClick={() => {
          logger.error({
            error: new Error("test sentry error"),
            sourceId: "test-error-2",
            contexts: {
              hello: {
                id: "userId4",
                name: "Jean",
              },
            },
          });
        }}
      >
        Test with context
      </Button>
      <Button
        onClick={() => {
          axios.post("http://localhost:3000/api/test").catch((error) => {
            const errorId = logger.error({
              error,
              sourceId: "test-error-4",
            });
            console.log("errorId", errorId);
          });
        }}
      >
        Axios error with vault context
      </Button>
      <Button
        onClick={() => {
          axios.post("http://localhost:3000/api/hello").catch((error) => {
            const errorId = logger.error({
              level: "fatal",
              error,
              sourceId: "test-error-fatal-5",
            });
            console.log("errorId", errorId);
          });
        }}
      >
        Axios fatal with vault context
      </Button>
    </Container>
  );
}
