import styled from "styled-components";
import Ziki from "../../../../../../components/Ziki";
import colors from "../../../../../../theme/colors";
import { useVault } from "../../../../../../libs/vault";

const Container = styled.div`
  display: flex;
  align-items: center;
  background-color: ${colors.blue9};
`;

const Name = styled.div`
  color: ${colors.blue0};
  font-size: 16px;
`;

export default function VaultName(): JSX.Element {
  const vault = useVault();

  return (
    <Container>
      <Ziki name="ziki8" style={{ width: 32, marginRight: 10 }} />
      <Name>{vault.vaultName}</Name>
    </Container>
  );
}
