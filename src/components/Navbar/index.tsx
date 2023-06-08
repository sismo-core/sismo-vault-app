import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import VaultMenu from "./components/VaultMenu";
import { useVault } from "../../libs/vault";
import env from "../../environment";
import LinksMenu from "./components/LinksMenu";
import SignInButton from "../SignInButton";

const MobileNav = styled.div`
  display: none;

  @media (max-width: 1240px) {
    display: flex;
    padding: 10px 25px;
    justify-content: space-between;
  }
`;

const Content = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  padding-bottom: 15px;
  @media (max-width: 800px) {
    padding-top: 5px;
    align-items: center;
  }
`;

const Container = styled.div<{ scrollbarWidth: number; displayNav: boolean }>`
  height: 90px;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  padding: 0px 60px;
  padding-right: ${(props) => 60 - props.scrollbarWidth}px;
  z-index: 5;

  @media (max-width: 1240px) {
    display: none;
  }
  @media (max-width: 800px) {
    padding: 0px 10px;
    padding-right: ${(props) => 10 - props.scrollbarWidth}px;
    height: 50px;
    width: 100%;
  }
`;

const Section = styled.div<{
  left?: boolean;
  center?: boolean;
  right?: boolean;
  isHidden?: boolean;
}>`
  display: flex;
  visibility: ${(props) => (props.isHidden ? "hidden" : "visible")};
  align-items: flex-end;
  height: 100%;
  flex: 0 0 auto;

  ${(props) =>
    props.center &&
    `
    position: absolute;
    left: 50%;
    transform: translateX(-50%) translateY(-85%);
    top: 50%;

  `}

  @media (min-width: 801px) {
    ${(props) =>
      props.left &&
      `
      justify-content: left;
    `}
    ${(props) =>
      props.center &&
      `
      justify-content: center;
    `}
    ${(props) =>
      props.right &&
      `
      justify-content: right;
    `}
  }
  @media (max-width: 800px) {
    ${(props) =>
      props.left &&
      `
      justify-content: left;
    `}
    ${(props) =>
      props.center &&
      `
      justify-content: center;
      align-items: center;
      height: 100%;
    `}
    ${(props) =>
      props.right &&
      `
      justify-content: right;
    `}
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: flex-end;
  flex-direction: row;
  cursor: pointer;
  width: 70px;
  height: 70px;

  @media (max-width: 800px) {
    width: 40px;
    height: 40px;
  }
`;

const Tag = styled.div`
  background-color: ${(props) => props.theme.colors.orange2};
  border-radius: 2px;
  color: ${(props) => props.theme.colors.blue11};
  padding: 1px 5px;
  font-size: 12px;
  line-height: 18px;
  margin-top: -10px;
  margin-left: -5px;
`;

const Inline = styled.div`
  display: flex;
  align-items: center;
`;

export default function Navbar({
  isImpersonated,
}: {
  isImpersonated: boolean;
}): JSX.Element {
  const vault = useVault();
  const navigate = useNavigate();
  let location = useLocation();
  const [scrollbarWidth, setScrollbarWidth] = useState(null);
  const [logoLoaded, setLogoLoaded] = useState(false);

  const displayNav = useMemo(() => {
    if (
      location.pathname === "/" ||
      location.pathname === "/home-beta" ||
      location.pathname.includes("/explorer")
    ) {
      return true;
    }
    return false;
  }, [location.pathname]);

  const isTopRightSectionHidden = useMemo(() => {
    if (location.pathname === "/" || location.pathname.includes("/explorer")) {
      return false;
    }
    return !vault.isConnected;
  }, [vault.isConnected, location.pathname]);

  useEffect(() => {
    const img = new Image();
    img.src = "/assets/logoV2.svg";
    img.onload = () => setLogoLoaded(true);
  }, []);

  useEffect(() => {
    function resizeHandler() {
      setScrollbarWidth(window.innerWidth - window.visualViewport.width);
    }
    window.visualViewport.addEventListener("resize", resizeHandler);
    return () =>
      window.visualViewport.removeEventListener("resize", resizeHandler);
  }, []);

  return (
    <>
      <MobileNav>
        <Logo style={{ marginRight: 30 }}>
          <img
            src="/assets/logoV2.svg"
            width="100%"
            height="100%"
            alt="Sismo logo"
            onClick={() => navigate("/")}
          />
        </Logo>

        <Inline>
          <VaultMenu />
        </Inline>
      </MobileNav>
      <Container scrollbarWidth={scrollbarWidth} displayNav={displayNav}>
        <Content>
          <Section left>
            <Logo style={{ marginRight: 30, marginLeft: -15 }}>
              <img
                src="/assets/logoV2.svg"
                height="100%"
                alt="Sismo logo"
                onClick={() => navigate("/")}
              />
              {logoLoaded && (
                <Tag>
                  {isImpersonated
                    ? "Impersonated"
                    : env.name === "STAGING_BETA"
                    ? `
                      Staging
                    `
                    : env.name === "PROD_BETA"
                    ? `
                      Beta
                    `
                    : env.name === "DEMO"
                    ? `
                      Demo
                    `
                    : env.name === "DEV_BETA"
                    ? `
                      Dev
                    `
                    : null}
                </Tag>
              )}
            </Logo>
          </Section>

          <Section right isHidden={isTopRightSectionHidden}>
            <LinksMenu />
            {vault.isConnected ? <VaultMenu /> : <SignInButton />}
          </Section>
        </Content>
      </Container>
    </>
  );
}
