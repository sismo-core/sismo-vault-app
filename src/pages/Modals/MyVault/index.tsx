import { useEffect, useState } from "react";
import styled from "styled-components";
import PageContainer from "../../../components/PageContainer";
import Accounts from "./Accounts";
import { useMyVault } from "./Provider";
import Settings from "./Settings";
import Menu from "./components/Menu";
import Icon, { IconProps } from "../../../components/Icon";
import env from "../../../environment";
import More from "./More";
import { ArrowLeft } from "phosphor-react";
import { useMainScrollManager } from "../../../libs/main-scroll-manager";
import { useVault } from "../../../libs/vault";

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0px;
  left: 0px;
  z-index: 2000;
  //backdrop-filter: blur(20px);
  background: linear-gradient(285.51deg, #193970 -75.32%, #12203d 76.45%);
  max-height: 100vh;
  overflow-y: auto;
`;

const BackToTheApp = styled.div<{ visible: boolean }>`
  cursor: pointer;
  position: fixed;
  font-size: 14px;
  line-height: 150%;
  display: flex;
  align-items: center;
  color: #d0d7fb;
  top: 40px;
  z-index: 2;
  @media (max-width: 800px) {
    margin-left: 10px;
    ${(props) =>
      !props.visible &&
      `
        display: none;
      `}
  }
`;

const MobileHeader = styled.div<{ visible: boolean }>`
  width: 100%;
  position: relative;
  height: 80px;
  display: flex;
  align-items: center;
  z-index: 2;
  @media (max-width: 800px) {
    ${(props) =>
      props.visible &&
      `
      display: none;
    `}
  }
  @media (min-width: 800px) {
    display: none;
  }
`;

const Back = styled.div`
  cursor: pointer;
  font-size: 14px;
  line-height: 150%;
  display: flex;
  align-items: center;
  color: #d0d7fb;
  min-height: 100%;
`;

const Title = styled.div`
  line-height: 17px;
  display: flex;
  align-items: center;
  color: #e9ecff;
  width: calc(100% - 130px);
  justify-content: center;
`;

const Content = styled.div`
  display: flex;
  margin-top: 100px;
  gap: 20px;
  @media (max-width: 800px) {
    margin-top: 20px;
  }
`;

const Center = styled.div`
  width: 100%;
  max-width: 1800px;
  position: relative;
`;

const TABS: {
  id: string;
  label: string;
  icon: IconProps["name"];
}[] = [
  {
    id: "accounts",
    label: "Accounts",
    icon: "destinations-outline-white",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "settings-outline-white",
  },
  {
    id: "more",
    label: "More",
    icon: "more-outline-white",
  },
];

export default function MyVaultModal() {
  const myVault = useMyVault();
  const state = useMyVault();
  const { disabledScroll, enabledScroll } = useMainScrollManager();

  const vault = useVault();

  useEffect(() => {
    console.log("myVault", vault);
  }, [vault]);

  useEffect(() => {
    if (state.isOpen) {
      disabledScroll("myVault");
    }
    return () => enabledScroll("myVault");
  }, [state.isOpen, disabledScroll, enabledScroll]);

  if (!state.isOpen) return <></>;

  return (
    <Container>
      <PageContainer ignoreScrollBar>
        <Center>
          {myVault.tab !== "menu" && (
            <MobileHeader
              onClick={() => myVault.switchTab("menu")}
              visible={myVault.tab === "menu"}
            >
              <Back>
                <ArrowLeft size={15} style={{ marginRight: 15 }} />
                Back
              </Back>
              {myVault.tab && (
                <Title>
                  <Icon
                    name={TABS.find((tab) => tab.id === myVault.tab).icon}
                    style={{ width: 16, marginRight: 8 }}
                  />
                  {TABS.find((tab) => tab.id === myVault.tab).label}
                </Title>
              )}
            </MobileHeader>
          )}
          <Content id="myvaultcontent">
            <BackToTheApp
              onClick={() => myVault.close()}
              visible={myVault.tab === "menu"}
            >
              <Icon
                name="arrowLeft-outline-white"
                style={{
                  marginRight: 15,
                  width: 15,
                  transform: "rotate(-180deg)",
                }}
              />
              Back to the app
            </BackToTheApp>
            <Menu
              visible={myVault.tab === "menu"}
              tabs={TABS}
              activeTab={myVault.tab}
              onSwitchTab={(tabId) => {
                myVault.switchTab(tabId);
              }}
            />
            {myVault.tab === "accounts" && <Accounts />}
            {myVault.tab === "settings" && <Settings />}
            {myVault.tab === "more" && <More />}
          </Content>
        </Center>
      </PageContainer>
    </Container>
  );
}
