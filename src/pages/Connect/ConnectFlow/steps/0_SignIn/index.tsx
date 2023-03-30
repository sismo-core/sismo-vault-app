import { useState, useEffect, Fragment } from "react";
import styled from "styled-components";
import Button from "../../../../../components/Button";
import { useVault } from "../../../../../libs/vault";
import HeaderTitle from "../../components/HeaderTitle";
import { ArrowSquareOut, Info } from "phosphor-react";
import { capitalizeFirstLetter } from "../../../../../utils/capitalizeFirstLetter";
import ConnectVaultModal from "../../../../Modals/ConnectVaultModal";
import Skeleton from "./components/Skeleton";
import HoverTooltip from "../../../../../components/HoverTooltip";
import colors from "../../../../../theme/colors";
//import { ZkConnectRequest } from "@sismo-core/zk-connect-client";
import { ZkConnectRequest } from "../../../localTypes";
import ShardTag from "../../components/ShardTag";
import { FactoryApp } from "../../../../../libs/sismo-client";
import {
  RequestGroupMetadata,
  ClaimType,
  AuthType,
  GroupMetadataDataRequestEligibility,
} from "../../../../../libs/sismo-client/zk-connect-prover/zk-connect-v2";
import EligibilityModal from "../../components/EligibilityModal";
import AuthTag from "../../components/AuthTag";

const Container = styled.div<{ hasDataRequest: boolean }>`
  background-color: ${(props) => props.theme.colors.blue11};
  color: ${(props) => props.theme.colors.blue0};
  width: 100%;
  padding: 24px 30px 40px 30px;
  border-radius: 10px;

  min-height: ${(props) => (props.hasDataRequest ? "500px" : "388px")};

  display: flex;
  flex-direction: column;

  box-sizing: border-box;
`;

const Content = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
`;

const TopContent = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const ContentTitle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-bottom: 24px;
`;

const AppLogo = styled.img`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  margin-bottom: 20px;
`;

const DataRequested = styled.div`
  font-size: 14px;
  line-height: 20px;
  font-family: ${(props) => props.theme.fonts.regular};
  color: ${(props) => props.theme.colors.blue0};
  margin-bottom: 10px;
`;

const GroupWrapper = styled.div`
  border: 1px solid ${(props) => props.theme.colors.blue7};
  border-radius: 5px;
  padding: 8px;

  flex-wrap: wrap;
  width: 360px;
  margin-bottom: 20px;
  box-sizing: border-box;

  @media (max-width: 900px) {
    width: 100%;
  }
`;

const AndWrapper = styled(GroupWrapper)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AndInner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const OrWrapper = styled(GroupWrapper)`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 4px;
`;

const OrSperator = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Line = styled.div`
  height: 1px;
  width: 100%;
  background: ${(props) => props.theme.colors.blue9};
`;

const OrText = styled.div`
  font-size: 14px;
  line-height: 20px;
  font-family: ${(props) => props.theme.fonts.medium};
`;

const MessageWrapper = styled.div`
  display: flex;
  flex-direction: column;

  padding: 8px;
  gap: 10px;

  width: 360px;
  max-height: 86px;
  overflow: auto;

  background: ${(props) => props.theme.colors.blue9};
  border-radius: 5px;
  font-size: 14px;
  line-height: 20px;

  color: ${(props) => props.theme.colors.blue0};
  margin-bottom: 20px;
  box-sizing: border-box;

  @media (max-width: 900px) {
    width: 100%;
  }
`;

const MessageTitle = styled.div`
  font-family: ${(props) => props.theme.fonts.bold};
`;

const Message = styled.div`
  font-family: ${(props) => props.theme.fonts.medium};
  word-break: break-all;
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
  factoryApp: FactoryApp;
  zkConnectRequest: ZkConnectRequest;
  requestGroupsMetadata: RequestGroupMetadata[] | null;
  groupMetadataDataRequestEligibilities:
    | GroupMetadataDataRequestEligibility[]
    | null;
  referrerUrl: string;
  onNext: () => void;
};

export default function SignIn({
  groupMetadataDataRequestEligibilities,
  requestGroupsMetadata,
  zkConnectRequest,
  referrerUrl,
  factoryApp,
  onNext,
}: Props) {
  const [connectIsOpen, setConnectIsOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [initialGroupId, setInitialGroupId] = useState<string | null>(null);

  const vault = useVault();
  // const proveName = badge?.name?.split(" ZK Badge")[0] || null;
  // const article = ["a", "e", "i", "o", "u"].includes(badge?.name) ? "an" : "a";

  const hasClaim = zkConnectRequest?.requestContent?.dataRequests?.some(
    (dataRequest) => dataRequest?.claimRequest?.claimType !== ClaimType.EMPTY
  );

  useEffect(() => {
    const loadImage = (url) => {
      return new Promise((resolve, reject) => {
        const loadImg = new Image(96, 96);
        loadImg.src = url;
        loadImg.onload = () => resolve(url);
        loadImg.onerror = (err) => reject(err);
      });
    };

    if (factoryApp) {
      loadImage(factoryApp.logoUrl).then(() => {
        setImgLoaded(true);
      });
    }
  }, [factoryApp]);

  const loading = hasClaim
    ? !factoryApp ||
      vault.loadingActiveSession ||
      !zkConnectRequest ||
      !imgLoaded ||
      !requestGroupsMetadata ||
      !groupMetadataDataRequestEligibilities
    : !factoryApp ||
      vault.loadingActiveSession ||
      !imgLoaded ||
      !groupMetadataDataRequestEligibilities;

  let consolidatedMessageSignatureRequest: string = "";

  if (zkConnectRequest?.requestContent?.dataRequests.length) {
    for (const dataRequest of zkConnectRequest?.requestContent?.dataRequests) {
      if (dataRequest?.messageSignatureRequest) {
        consolidatedMessageSignatureRequest +=
          dataRequest?.messageSignatureRequest + " ";
      }
    }
  }

  function onShardClick(groupId: string) {
    setModalIsOpen(true);
    setInitialGroupId(groupId);
  }
  return (
    <>
      <ConnectVaultModal
        isOpen={connectIsOpen}
        onClose={() => setConnectIsOpen(false)}
      />
      {requestGroupsMetadata && (
        <EligibilityModal
          isOpen={modalIsOpen}
          onClose={() => setModalIsOpen(false)}
          requestGroupsMetadata={requestGroupsMetadata}
          initialGroupId={initialGroupId}
        />
      )}
      <Container hasDataRequest={Boolean(requestGroupsMetadata?.length)}>
        <HeaderTitle url={referrerUrl} style={{ marginBottom: 20 }} />

        {loading && <Skeleton />}
        {!loading && (
          <Content>
            <TopContent>
              <ContentTitle>
                <AppLogo src={factoryApp?.logoUrl} alt={factoryApp?.name} />
                <SecondLine>
                  Connect to
                  <Bold>{capitalizeFirstLetter(factoryApp?.name)}</Bold>
                  <HoverTooltip
                    width={300}
                    text="Connecting with your Vault does not reveal the accounts inside. You only reveal your Vault ID—an anonymous app-specific identifier that authenticates ownership of a Data Vault. "
                  >
                    <Info size={12} color={colors.blue0} />
                  </HoverTooltip>
                </SecondLine>
              </ContentTitle>

              <DataRequested>Requested Data:</DataRequested>
              {(!zkConnectRequest?.requestContent?.operators?.length ||
                zkConnectRequest?.requestContent?.operators[0] === "AND") && (
                <AndWrapper>
                  {groupMetadataDataRequestEligibilities.length > 0 &&
                    groupMetadataDataRequestEligibilities?.map(
                      (dataRequestEligibility, index) => (
                        <AndInner key={index + "/statement-request/and"}>
                          {dataRequestEligibility?.claimRequestEligibility
                            ?.claimRequest?.claimType !== ClaimType.EMPTY && (
                            <ShardTag
                              groupMetadata={
                                dataRequestEligibility?.claimRequestEligibility
                                  ?.groupMetadata
                              }
                              claimType={
                                dataRequestEligibility?.claimRequestEligibility
                                  ?.claimRequest?.claimType
                              }
                              requestedValue={
                                dataRequestEligibility?.claimRequestEligibility
                                  ?.claimRequest?.value
                              }
                              onModal={() =>
                                onShardClick(
                                  dataRequestEligibility
                                    ?.claimRequestEligibility?.groupMetadata?.id
                                )
                              }
                            />
                          )}
                          {dataRequestEligibility?.authRequestEligibility
                            ?.authRequest?.authType !== AuthType.EMPTY && (
                            <AuthTag
                              authRequest={
                                dataRequestEligibility?.authRequestEligibility
                                  ?.authRequest
                              }
                            />
                          )}
                        </AndInner>
                      )
                    )}
                </AndWrapper>
              )}
              {zkConnectRequest?.requestContent?.operators[0] === "OR" && (
                <OrWrapper>
                  {groupMetadataDataRequestEligibilities.length > 0 &&
                    groupMetadataDataRequestEligibilities?.map(
                      (dataRequestEligibility, index) => (
                        <Fragment key={index + "/statement-request/or"}>
                          {index !== 0 && (
                            <OrSperator>
                              <Line />
                              <OrText>or</OrText>
                              <Line />
                            </OrSperator>
                          )}
                          <AndInner>
                            {dataRequestEligibility?.claimRequestEligibility
                              ?.claimRequest?.claimType !== ClaimType.EMPTY && (
                              <ShardTag
                                groupMetadata={
                                  dataRequestEligibility
                                    ?.claimRequestEligibility?.groupMetadata
                                }
                                claimType={
                                  dataRequestEligibility
                                    ?.claimRequestEligibility?.claimRequest
                                    ?.claimType
                                }
                                requestedValue={
                                  dataRequestEligibility
                                    ?.claimRequestEligibility?.claimRequest
                                    ?.value
                                }
                                onModal={() =>
                                  onShardClick(
                                    dataRequestEligibility
                                      ?.claimRequestEligibility?.groupMetadata
                                      ?.id
                                  )
                                }
                              />
                            )}
                            {dataRequestEligibility?.authRequestEligibility
                              ?.authRequest?.authType !== AuthType.EMPTY && (
                              <AuthTag
                                authRequest={
                                  dataRequestEligibility?.authRequestEligibility
                                    ?.authRequest
                                }
                              />
                            )}
                          </AndInner>
                        </Fragment>
                      )
                    )}
                </OrWrapper>
              )}

              {consolidatedMessageSignatureRequest && (
                <MessageWrapper>
                  <MessageTitle>Message Signature Request</MessageTitle>
                  <Message>{consolidatedMessageSignatureRequest}</Message>
                </MessageWrapper>
              )}
            </TopContent>
            <ButtonGroup>
              <Link
                onClick={() =>
                  window.open(
                    "https://docs.sismo.io/sismo-docs/what-is-sismo/prove-with-sismo",
                    "_blank"
                  )
                }
              >
                What is zkConnect <ArrowSquareOut />
              </Link>

              {vault.isConnected ? (
                <Button
                  style={{ width: "100%" }}
                  success
                  onClick={() => onNext()}
                >
                  Connect
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
            </ButtonGroup>
          </Content>
        )}
      </Container>
    </>
  );
}
