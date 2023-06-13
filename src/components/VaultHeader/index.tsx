import styled from "styled-components";
import { useVault } from "../../hooks/vault";
import Ziki from "../Ziki";

const Container = styled.div`
  font-size: 14px;
  color: #d0d7fb;
  height: 50px;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-left: 5px;
`;

const AccountInfo = styled.div`
  font-size: 12px;
  color: #b1bcf1;
`;

const Infos = styled.div`
  color: #e9ecff;
  display: flex;
  flex-direction: column;
  font-size: 16px;
`;

type VaultHeaderProps = {
  title: string;
};

export default function VaultHeader({ title }: VaultHeaderProps): JSX.Element {
  const vault = useVault();

  return (
    <Container>
      <Ziki name="ziki8" style={{ width: 32 }} />
      <Infos style={{ marginLeft: 5 }}>
        {vault.vaultName}
        <AccountInfo style={{ marginTop: 2 }}>{title}</AccountInfo>
      </Infos>
    </Container>
  );
}
