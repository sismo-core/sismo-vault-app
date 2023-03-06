import styled from "styled-components";
import Button from "../../../../components/Button";

const Container = styled.div`
  width: 320px;
  height: 213.22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 30px;
  box-sizing: border-box;

  color: ${(props) => props.theme.colors.blue0};

  @media (max-width: 800px) {
    width: 315px;
  }
`;

const Top = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.div`
  align-self: flex-start;
  font-size: 20px;
  line-height: 30px;

  margin-bottom: 21.22px;
  font-family: ${(props) => props.theme.fonts.medium};
`;

const Bottom = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

type Props = {
  onCreate: () => void;
  onRetrieve: () => void;
};

export default function VaultNotFound({
  onCreate,
  onRetrieve,
}: Props): JSX.Element {
  return (
    <Container>
      <Top>
        <Title>No Vault found</Title>
      </Top>
      <Bottom>
        <Button
          style={{
            marginBottom: 10,
            width: "100%",
          }}
          onClick={() => onCreate()}
          primary
        >
          Create a Sismo Vault
        </Button>
        <Button
          style={{
            width: "100%",
          }}
          onClick={() => onRetrieve()}
        >
          Retrieve your Vault
        </Button>
      </Bottom>
    </Container>
  );
}
