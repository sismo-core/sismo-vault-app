import styled from "styled-components";
import Blockies from "react-blockies";
import Icon from "../Icon";

const OwnerContainer = styled.div`
  display: flex;
  justify-content: left;
  align-items: center;
  padding: 5px 20px 5px 10px;
  height: calc(65px - 20px);
  border-radius: 5px;
  position: relative;
`;

const OwnerInfos = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 5px;
`;

const OwnerTitle = styled.div`
  font-size: 12px;
  color: #d0d7fb;
  @media (max-width: 750px) {
    font-size: 10px;
  }
`;

const BlockiesContainer = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 2px;
  overflow: hidden;
`;

const OwnerAddress = styled.div`
  font-size: 14px;
  display: flex;
  justify-content: flex-start;
  color: #e9ecff;
  position: relative;

  @media (max-width: 750px) {
    font-size: 14px;
  }
`;

const OwnerKeyContainer = styled.div`
  position: absolute;
`;

const OwnerKey = styled.div`
  position: absolute;
  bottom: -30px;
  left: -4px;
`;

type OwnerDetailsProps = {
  address: string;
  main: string;
  subtitle: string;
};

export default function OwnerDetails({ address, main, subtitle }: OwnerDetailsProps): JSX.Element {
  return (
    <OwnerContainer style={{ marginBottom: 5, marginTop: 5 }}>
      {address && (
        <BlockiesContainer style={{ marginLeft: 10 }}>
          <Blockies seed={address} size={8} scale={2.5} />
        </BlockiesContainer>
      )}
      {address ? (
        <OwnerKeyContainer>
          <OwnerKey>
            <Icon name="key-fill-blue" />
          </OwnerKey>
        </OwnerKeyContainer>
      ) : (
        <Icon name="key-fill-blue" />
      )}
      <OwnerInfos style={{ marginLeft: 5 }}>
        <OwnerAddress>{main}</OwnerAddress>
        <OwnerTitle>{subtitle}</OwnerTitle>
      </OwnerInfos>
    </OwnerContainer>
  );
}
