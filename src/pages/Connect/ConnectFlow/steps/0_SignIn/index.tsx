import { useState, useEffect } from "react";
import styled from "styled-components";
import Button from "../../../../../components/Button";
import { useVault } from "../../../../../libs/vault";
import HeaderTitle from "../../components/HeaderTitle";
import { ArrowSquareOut, Info } from "phosphor-react";
import { capitalizeFirstLetter } from "../../../../../utils/capitalizeFirstLetter";
import ConnectVaultModal from "../../../../Modals/ConnectVaultModal";
import { FactoryAppType, GroupMetadata } from "../../..";
import Skeleton from "./components/Skeleton";
import HoverTooltip from "../../../../../components/HoverTooltip";
import colors from "../../../../../theme/colors";
import { ZkConnectRequest } from "@sismo-core/zk-connect-client";
import ShardTag from "../../components/ShardTag";
import { BigNumber } from "ethers";

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
  margin-bottom: 6px;
`;

const Separator = styled.div`
  width: 252px;
  height: 1px;
  background: ${(props) => props.theme.colors.blue9};
  margin-bottom: 10px;
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
  factoryApp: FactoryAppType;
  zkConnectRequest: ZkConnectRequest;
  groupMetadata: GroupMetadata | null;
  referrerUrl: string;
  appName: string;
  hasDataRequest: boolean;
  onNext: () => void;
};

export default function SignIn({
  groupMetadata,
  zkConnectRequest,
  appName,
  referrerUrl,
  factoryApp,
  hasDataRequest,
  onNext,
}: Props) {
  const [connectIsOpen, setConnectIsOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(true);

  const vault = useVault();
  // const proveName = badge?.name?.split(" ZK Badge")[0] || null;
  // const article = ["a", "e", "i", "o", "u"].includes(badge?.name) ? "an" : "a";

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

  const loading = hasDataRequest
    ? !factoryApp ||
      !appName ||
      vault.loadingActiveSession ||
      !zkConnectRequest ||
      !imgLoaded ||
      !groupMetadata
    : !factoryApp || !appName || vault.loadingActiveSession || !imgLoaded;

  return (
    <>
      <ConnectVaultModal
        isOpen={connectIsOpen}
        onClose={() => setConnectIsOpen(false)}
      />

      <Container hasDataRequest={hasDataRequest}>
        <HeaderTitle url={referrerUrl} style={{ marginBottom: 20 }} />

        {loading && <Skeleton />}
        {!loading && (
          <Content>
            <TopContent>
              <ContentTitle>
                <AppLogo src={factoryApp?.logoUrl} alt={appName} />
                <SecondLine>
                  Connect to
                  <Bold>{capitalizeFirstLetter(appName)}</Bold>
                  <HoverTooltip
                    width={300}
                    text="Connecting with your Vault does not reveal the accounts inside. You only reveal your Vault ID—an anonymous app-specific identifier that authenticates ownership of a Data Vault. "
                  >
                    <Info size={12} color={colors.blue0} />
                  </HoverTooltip>
                </SecondLine>
              </ContentTitle>

              {hasDataRequest && (
                <>
                  <DataRequested>Requested Data</DataRequested>
                  <Separator />
                  <ShardTag
                    groupMetadata={groupMetadata}
                    comparator={
                      zkConnectRequest?.dataRequest?.statementRequests[0]
                        ?.comparator
                    }
                    requestedValue={
                      BigNumber.from(
                        zkConnectRequest?.dataRequest?.statementRequests[0]
                          ?.requestedValue
                      ).toNumber() || 1
                    }
                  />
                  <div>EXTRA DATA:</div>
                  <div>
                    {
                      zkConnectRequest?.dataRequest?.statementRequests[0]
                        .extraData
                    }
                  </div>
                </>
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
