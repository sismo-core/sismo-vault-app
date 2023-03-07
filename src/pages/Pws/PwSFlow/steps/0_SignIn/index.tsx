import { useState } from "react";
import styled from "styled-components";
import Button from "../../../../../components/Button";
import { useVault } from "../../../../../libs/vault";
import HeaderTitle from "../../components/HeaderTitle";
import MintSchema from "./components/MintSchema";
import { ArrowsOutSimple, ArrowSquareOut } from "phosphor-react";
import colors from "../../../../../theme/colors";
import { capitalizeFirstLetter } from "../../../../../utils/capitalizeFirstLetter";
import ConnectVaultModal from "../../../../Modals/ConnectVaultModal";
import { FactoryAppType, GroupMetadata } from "../../..";
import Skeleton from "./components/Skeleton";
import EligibilityModal from "../../components/EligibilityModal";

const Container = styled.div`
  background-color: ${(props) => props.theme.colors.blue11};
  color: ${(props) => props.theme.colors.blue0};
  width: 100%;
  padding: 24px 30px 40px 30px;
  border-radius: 10px;

  min-height: 507px;
  gap: 48px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  box-sizing: border-box;
`;

const Content = styled.div`
  display: flex;
  flex-direction: center;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const ContentTitle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-bottom: 20px;
`;

const FirstLine = styled.span`
  font-family: ${(props) => props.theme.fonts.regular};
  font-size: 16px;
  line-height: 22px;
`;

const GroupTag = styled.div`
  font-family: ${(props) => props.theme.fonts.medium};
  font-size: 14px;
  line-height: 20px;
  color: ${(props) => props.theme.colors.blue0};
  padding: 2px 8px;
  background: ${(props) => props.theme.colors.blue9};
  border-radius: 4px;
`;

const SecondLine = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  font-family: ${(props) => props.theme.fonts.regular};
  font-size: 16px;
  line-height: 22px;
`;

const Bold = styled.span`
  font-family: ${(props) => props.theme.fonts.bold};
`;

const EligibilityLink = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  font-size: 14px;
  line-height: 20px;
  font-family: ${(props) => props.theme.fonts.medium};
  color: ${(props) => props.theme.colors.blue2};
  gap: 5px;
`;

const ArrowWrapper = styled(ArrowsOutSimple)`
  align-self: flex-start;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  margin: 0 auto;
  width: 252px;
`;

const Link = styled.a`
  align-self: flex-end;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font-family: ${(props) => props.theme.fonts.medium};
  color: ${(props) => props.theme.colors.blue4};
  font-size: 12px;
  line-height: 18px;
  text-decoration: none;
  cursor: pointer;
`;

type Props = {
  factoryApp: FactoryAppType;
  groupMetadata: GroupMetadata | null;
  referrerUrl: string;
  referrerName: string;
  onNext: () => void;
};

export default function SignIn({
  groupMetadata,
  referrerName,
  referrerUrl,
  factoryApp,
  onNext,
}: Props) {
  const [connectIsOpen, setConnectIsOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const vault = useVault();
  // const proveName = badge?.name?.split(" ZK Badge")[0] || null;
  // const article = ["a", "e", "i", "o", "u"].includes(badge?.name) ? "an" : "a";

  const humanReadableGroupName = groupMetadata?.name
    ?.replace(/-/g, " ")
    .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));

  return (
    <>
      <ConnectVaultModal
        isOpen={connectIsOpen}
        onClose={() => setConnectIsOpen(false)}
      />
      <EligibilityModal
        groupMetadata={groupMetadata}
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
      />

      <Container>
        <HeaderTitle url={referrerUrl} />

        {(!factoryApp || !referrerName || !groupMetadata) && <Skeleton />}
        {factoryApp && referrerName && groupMetadata && (
          <>
            <MintSchema
              referrerName={referrerName}
              logoUrl={factoryApp?.logoUrl}
            />
            <Content>
              <ContentTitle>
                <FirstLine>
                  <Bold>{capitalizeFirstLetter(referrerName)}</Bold> wants to
                  verify that you belong to
                </FirstLine>
                <SecondLine>
                  <GroupTag>{humanReadableGroupName}</GroupTag>
                  group.
                </SecondLine>
              </ContentTitle>

              <EligibilityLink onClick={() => setModalIsOpen(true)}>
                Eligibility{" "}
                <ArrowWrapper>
                  <ArrowsOutSimple size={13.74} color={colors.blue2} />
                </ArrowWrapper>
              </EligibilityLink>
            </Content>
            <ButtonGroup>
              <Link
                onClick={() =>
                  window.open(
                    "https://docs.sismo.io/sismo-docs/what-is-sismo/prove-with-sismo",
                    "_blank"
                  )
                }
              >
                What is a ZK Proof <ArrowSquareOut />
              </Link>

              {vault.isConnected ? (
                <Button
                  style={{ width: "100%" }}
                  success
                  onClick={() => onNext()}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  style={{ width: "100%" }}
                  primary
                  onClick={() => setConnectIsOpen(true)}
                >
                  Sign-in to Sismo
                </Button>
              )}
            </ButtonGroup>{" "}
          </>
        )}
      </Container>
    </>
  );
}
