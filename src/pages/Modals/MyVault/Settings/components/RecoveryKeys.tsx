import styled from "styled-components";
import Button from "../../../../../components/Button";
import colors from "../../../../../theme/colors";
import { useVault } from "../../../../../libs/vault";
import { useGenerateRecoveryKey } from "../../../GenerateRecoveryKey/provider";
import RecoveryKeyLine from "./RecoveryKeyLine";

const Container = styled.div`
  background-color: ${colors.blue10};
  width: 100%;
  box-sizing: border-box;
  padding: 40px 30px 100px 30px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
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

const Bottom = styled.div`
  position: absolute;
  bottom: 40px;
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

const NoKeys = styled.div`
  margin: 20px 0;

  font-size: 16px;
  line-height: 150%;
  color: ${colors.blue4};
  text-align: center;
`;

export default function RecoveryKeys() {
  const vault = useVault();
  const generateRecoveryKey = useGenerateRecoveryKey();

  return (
    <>
      <Container>
        <Title style={{ marginBottom: 20 }}>Recovery keys</Title>
        <OwnerScroll>
          {vault.recoveryKeys &&
            vault.recoveryKeys
              .filter((recoveryKey) => recoveryKey.valid)
              .map((recoveryKey) => (
                <RecoveryKeyLine
                  recoveryKey={recoveryKey}
                  key={"backup" + recoveryKey.name + recoveryKey.timestamp}
                />
              ))}
          {!vault?.recoveryKeys && <NoKeys>No Recovery Key</NoKeys>}
        </OwnerScroll>
        <Bottom>
          <Button
            style={{ width: 280, marginTop: 10 }}
            onClick={() => generateRecoveryKey.open()}
          >
            + Generate a Recovery Key
          </Button>
        </Bottom>
      </Container>
    </>
  );
}
