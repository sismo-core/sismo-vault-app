import styled from "styled-components";
import { SismoConnectDataSource } from "../../../../libs/vault-client";
import { getMinimalIdentifier } from "../../../../utils/getMinimalIdentifier";
import EligibilityModal from "./EligibilityModal";
import { GroupMetadata } from "../../../../libs/sismo-client";
import { useState } from "react";
import { Info } from "phosphor-react";
import colors from "../../../../theme/colors";
import Icon from "../../../../components/Icon";
import { useVault } from "../../../../hooks/vault";

const Container = styled.div`
  padding: 8px;
  background-color: ${(props) => props.theme.colors.orange1};
  border-radius: 5px;
  font-size: 14px;
  color: ${(props) => props.theme.colors.blue11};
  line-height: 20px;
  margin-bottom: 24px;
`;

const Identifier = styled.span`
  background: #fff;
  border-radius: 4px;
  padding: 0px 4px;
`;

const Bold = styled.span`
  font-family: ${(props) => props.theme.fonts.semibold};
`;

const InfoWrapper = styled.span`
  cursor: pointer;
  margin-right: 4px;
  margin-left: 1px;
`;

type Props = {
  sismoConnectDataSource: SismoConnectDataSource;
  groupMetadata: GroupMetadata;
};

export default function SismoConnectDataSourceBanner({
  sismoConnectDataSource,
  groupMetadata,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const vault = useVault();
  const config = vault.sismoConnectDataSourceConfigProvider.getConfig(sismoConnectDataSource);

  const getIcon = () => {
    if (config.type === "worldcoin") {
      return (
        <Icon
          name="worldcoin-outline-blue"
          style={{ height: 16, marginBottom: -2, marginRight: 2 }}
        />
      );
    }
  };

  return (
    <>
      <EligibilityModal
        groupMetadata={groupMetadata}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <Container>
        Your vaultId{" "}
        <Identifier>
          {getIcon()}
          {getMinimalIdentifier(sismoConnectDataSource.vaultId)}
        </Identifier>{" "}
        for {config?.name} has been added as a new Data Source. If you completed the entire process,
        it will be part of the next {config?.name} Data Group within 24 hours.
        <InfoWrapper onClick={() => setIsModalOpen(true)}>
          <Info size={18} color={colors.blue11} style={{ marginBottom: -3 }} />
        </InfoWrapper>
        <Bold>Come back to generate your proof.</Bold>
      </Container>
    </>
  );
}
