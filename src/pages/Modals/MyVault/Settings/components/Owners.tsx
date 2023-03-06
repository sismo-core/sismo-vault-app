import styled from "styled-components";
import Button from "../../../../../components/Button";
import CheckBox from "../../../../../components/CheckBox";
import Loader from "../../../../../components/Loader";
import colors from "../../../../../theme/colors";
import { useVault } from "../../../../../libs/vault";
import OwnerLine from "./OwnerLine";
import { useImportAccount } from "../../../ImportAccount/provider";

const Container = styled.div`
  background-color: ${colors.blue10};
  width: 100%;
  box-sizing: border-box;
  padding: 40px 30px 100px 30px;
  position: relative;
  height: calc(100% - 160px);
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
`;

const Description = styled.div`
  font-size: 14px;
  color: #e9ecff;
  line-height: 19px;
  @media (max-width: 750px) {
    margin-top: 20px;
  }
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
`;

const Title = styled.div`
  font-size: 24px;
  line-height: 150%;
  color: #e9ecff;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
`;

const AutoImport = styled.div`
  color: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
`;

const Bottom = styled.div`
  position: absolute;
  bottom: 40px;
`;

const Importing = styled.div`
  color: ${colors.blue3};
  width: 100%;
  display: flex;
  align-items: center;
  margin-left: 30px;
  height: 65px;
`;

const LoadingText = styled.div`
  color: ${colors.blue3};
`;

const OwnerScroll = styled.div`
  overflow-x: auto;
  max-height: 100%;
  width: 100%;

  /* width */
  ::-webkit-scrollbar {
    width: 5px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: #1b2947;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #2a3557;
    border-radius: 20px;
    cursor: pointer;
    width: 5px;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
  }
`;

export default function Owners() {
  const vault = useVault();
  const importAccount = useImportAccount();

  const autoImportOwner = async () => {
    await vault.updateAutoImportOwners(
      vault.connectedOwner,
      !vault.autoImportOwners
    );
  };

  return (
    <>
      <Container>
        <Title style={{ marginBottom: 20 }}>Vault control access</Title>
        <Description>
          Owner accounts allow user to retrieve and decrypt their vault
        </Description>
        <AutoImport
          onClick={() => autoImportOwner()}
          style={{ marginTop: 30, marginBottom: 15 }}
        >
          <CheckBox
            isChecked={vault.autoImportOwners}
            style={{ marginRight: 8 }}
          />
          Add all new imported accounts as owners
        </AutoImport>
        <OwnerScroll>
          {vault.owners &&
            vault.owners.map((owner) => (
              <OwnerLine owner={owner} key={"owner" + owner.identifier} />
            ))}
        </OwnerScroll>
        {importAccount.importing && (
          <Importing>
            <Loader size={15} style={{ marginRight: 15 }} />
            <LoadingText>Importing...</LoadingText>
          </Importing>
        )}
        <Bottom>
          <Button
            style={{ width: 230, marginTop: 10 }}
            onClick={() =>
              importAccount.open({
                importType: "owner",
              })
            }
          >
            + Import owner
          </Button>
        </Bottom>
      </Container>
    </>
  );
}
