import styled from "styled-components";
import Modal from "../../../../../components/Modal";
import colors from "../../../../../theme/colors";
import EligibleLink from "./components/EligibleLink";
import Generation from "./components/Generation";
import Icon from "../../../../../components/Icon";
import { ArrowSquareOut } from "phosphor-react";
import { GroupMetadata } from "../../../../../libs/sismo-client";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  max-width: 800px;
  min-width: 795px;
  padding: 60px;
  color: ${colors.blue0};
  background-color: ${colors.blue11};
  border-radius: 10px;

  @media (max-width: 900px) {
    height: auto;
    top: default;
    max-width: calc(100vw - 80px);
    min-width: calc(100vw - 80px);
    padding: 25px;
    width: calc(100vw - 80px);
    gap: 15px;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
`;

const Id = styled.div`
  font-family: ${(props) => props.theme.fonts.medium};
  font-size: 12px;
  line-height: 18px;
  color: ${(props) => props.theme.colors.blue3};
  margin-bottom: 2px;
`;

const Title = styled.div`
  font-family: ${(props) => props.theme.fonts.bold};
  color: ${(props) => props.theme.colors.blue0};
  font-size: 24px;
  line-height: 24px;
  margin-bottom: 10px;

  @media (max-width: 900px) {
    font-size: 16px;
  }
`;

const Description = styled.div`
  font-family: ${(props) => props.theme.fonts.regular};
  font-size: 16px;
  line-height: 22px;
  color: ${(props) => props.theme.colors.blue0};
`;

const Eligibility = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 900px) {
    gap: 15px;
  }
`;

const Advanced = styled.div``;

const SubTitle = styled.div`
  font-size: 20px;
  line-height: 22px;
  font-family: ${(props) => props.theme.fonts.bold};
  color: ${(props) => props.theme.colors.blue0};

  @media (max-width: 900px) {
    font-size: 16px;
  }
`;

const SpecificationTitle = styled.div`
  font-family: ${(props) => props.theme.fonts.semibold};
  font-size: 14px;
  line-height: 20px;
  color: ${colors.blue1};
  margin-bottom: 10px;

  @media (max-width: 900px) {
    font-size: 14px;
    line-height: 20px;
    margin-bottom: 5px;
  }
`;

const Specifications = styled.div`
  font-family: ${(props) => props.theme.fonts.regular};
  font-size: 14px;
  line-height: 20px;
  color: ${colors.blue1};

  @media (max-width: 900px) {
    font-size: 12px;
    line-height: 18px;
  }
`;

const Separator = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${colors.blue8};
  border: 0px solid ${colors.blue8};
  border-radius: 1px;
  box-sizing: border-box;
`;

const GroupGenerator = styled.div`
  font-family: "Inter-Regular";
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 10px;
  margin-top: 10px;

  @media (max-width: 900px) {
    font-size: 12px;
    line-height: 18px;
    margin-bottom: 3px;
    margin-top: 5px;
  }
`;

const Link = styled.a`
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  color: ${colors.blue0};
  text-decoration: none;
`;

const LinkText = styled.div`
  font-family: "Inter-Medium";
  font-size: 14px;
  line-height: 20px;

  @media (max-width: 900px) {
    font-size: 12px;
    line-height: 18px;
  }
`;

const IconGithubContainer = styled.div`
  display: flex;
  align-items: center;
  width: 16px;
  height: 16px;

  @media (max-width: 900px) {
    width: 14px;
    height: 14px;
  }
`;

const IconContainer = styled.div`
  display: flex;
  align-items: flex-start;
  width: 12px;
  height: 12px;
  align-self: flex-start;

  @media (max-width: 900px) {
    width: 10px;
    height: 10px;
  }
`;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  groupMetadata: GroupMetadata;
};

export default function EligibilityModal({
  isOpen,
  onClose,
  groupMetadata,
}: Props): JSX.Element {
  const humanReadableGroupName = groupMetadata?.name
    ?.replace(/-/g, " ")
    .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      animated
      outsideClosable
      zIndex={2008}
    >
      <Container>
        <Header>
          <Id>{groupMetadata?.id}</Id>
          <Title>{humanReadableGroupName} group</Title>
          <Description>{groupMetadata?.description}</Description>
        </Header>
        <Separator />
        <Eligibility>
          <SubTitle>Eligibility</SubTitle>
          <EligibleLink
            accountsNumber={groupMetadata?.accountsNumber}
            dataUrl={groupMetadata?.dataUrl}
          />
          {groupMetadata?.specs && (
            <div>
              <SpecificationTitle>Specifications</SpecificationTitle>
              <Specifications>{groupMetadata?.specs}</Specifications>
            </div>
          )}
          <Generation
            lastGeneration={groupMetadata?.lastGenerationTimestamp}
            generationFrequency={groupMetadata?.generationFrequency}
          />
        </Eligibility>
        <Separator />
        <Advanced>
          <SubTitle>Advanced</SubTitle>

          <GroupGenerator>
            Group name: {groupMetadata?.groupGeneratorName}
          </GroupGenerator>
          <Link
            href={`https://github.com/sismo-core/sismo-hub/tree/main/group-generators/generators/${groupMetadata?.groupGeneratorName}/index.ts`}
            target="_blank"
            rel="noreferrer"
          >
            <IconGithubContainer>
              <Icon
                name="logoGithub-fill-blue0"
                style={{ width: "100%", height: "100%" }}
              />
            </IconGithubContainer>
            <LinkText>Group generator code</LinkText>

            <IconContainer>
              <ArrowSquareOut size={"100%"} weight="bold" />
            </IconContainer>
          </Link>
        </Advanced>
      </Container>
    </Modal>
  );
}
