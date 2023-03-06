import styled from "styled-components";
import { ArrowSquareOut, DotsThree, GameController } from "phosphor-react";
import useOnClickOutside from "../../../utils/useClickOutside";
import { useState, useRef } from "react";
import Logo, { LogoType } from "../../Logo";
import colors from "../../../theme/colors";
import env from "../../../environment";

const Container = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 5px;
  background-color: ${(props) => props.theme.colors.blue11};
  color: ${(props) => props.theme.colors.blue0};
  margin-right: 5px;

  user-select: none;
`;

const MoreMenucontainer = styled.div`
  position: absolute;
  top: 45px;
  right: 0px;

  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 5px;
  width: 175px;
  box-sizing: border-box;

  background-color: ${(props) => props.theme.colors.blue11};
  border-radius: 5px;

  cursor: default;
`;

const MoreMainLinksWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const MoreMainLink = styled.a`
  display: flex;
  align-items: center;
  padding: 5px 10px;
  gap: 5px;
  font-size: 14px;
  line-height: 21px;
  border-radius: 3px;

  transition: background-color 0.1s ease-in-out;
  box-sizing: border-box;
  color: inherit;

  &:hover {
    background-color: ${(props) => props.theme.colors.blue10};
  }

  cursor: pointer;
  text-decoration: none;
`;

const BadgeLogoWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
`;

const Separator = styled.div`
  width: 100%;
  height: 0.5px;
  background-color: ${(props) => props.theme.colors.blue8};
`;

const GovernanceLink = styled.a`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  line-height: 18px;
  font-family: ${(props) => props.theme.fonts.regular};
  color: ${(props) => props.theme.colors.blue1};

  padding: 5px 10px;
  box-sizing: border-box;

  cursor: pointer;
  text-decoration: none;
`;

const SocialWrapper = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;

  padding: 5px 10px;
  box-sizing: border-box;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  text-decoration: none;
`;

export default function LinksMenu(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useOnClickOutside(ref, () => setIsOpen(false));

  return (
    <Container ref={ref} onClick={toggleMenu}>
      <DotsThree size={20} weight="bold" />

      {isOpen && (
        <MoreMenucontainer>
          <MoreMainLinksWrapper>
            <MoreMainLink
              href="https://docs.sismo.io/sismo-docs/"
              target="_blank"
              rel="noreferrer"
            >
              <Logo type={LogoType.GITBOOK} size={14} />
              Docs
            </MoreMainLink>

            {env.name === "STAGING" || env.name === "PROD" ? (
              <MoreMainLink
                href="https://testnets.sismo.io"
                target="_blank"
                rel="noreferrer"
              >
                <GameController size={14} weight="bold" />
                Testnets
              </MoreMainLink>
            ) : (
              <MoreMainLink
                href="https://app.sismo.io"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="/icons/sismoLogo-fill-white.svg"
                  style={{ width: 14 }}
                  alt="Main app link"
                />
                Main app
              </MoreMainLink>
            )}
            <MoreMainLink
              href="https://factory.sismo.io/"
              target="_blank"
              rel="noreferrer"
            >
              <BadgeLogoWrapper>
                <Logo type={LogoType.BADGE} size={12} />
              </BadgeLogoWrapper>
              Sismo Factory
            </MoreMainLink>
          </MoreMainLinksWrapper>
          <Separator />
          <GovernanceLink
            href="https://sismo.notion.site/Sismo-Governance-Documentation-8d9f6ac5d2f049dfb15de35664602acb"
            target="_blank"
            rel="noreferrer"
          >
            Sismo Governance <ArrowSquareOut size={12} weight="bold" />{" "}
          </GovernanceLink>

          <SocialWrapper>
            <SocialLink
              href="https://twitter.com/sismo_eth"
              target="_blank"
              rel="noreferrer"
            >
              <Logo type={LogoType.TWITTER} size={12} color={colors.blue1} />
            </SocialLink>
            <SocialLink
              href="https://github.com/sismo-core"
              target="_blank"
              rel="noreferrer"
            >
              <Logo
                type={LogoType.GITHUB_ROUNDED}
                size={12}
                color={colors.blue1}
              />
            </SocialLink>

            <SocialLink
              href="https://discord.gg/sismo"
              target="_blank"
              rel="noreferrer"
            >
              <Logo type={LogoType.DISCORD} size={12} color={colors.blue1} />
            </SocialLink>
          </SocialWrapper>
        </MoreMenucontainer>
      )}
    </Container>
  );
}
