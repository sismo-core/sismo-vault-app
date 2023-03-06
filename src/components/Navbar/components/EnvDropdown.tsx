import { useState } from "react";
import styled from "styled-components";
import env from "../../../environment";
import Icon from "../../Icon";

const Container = styled.div`
  display: flex;
  position: relative;
  @media (max-width: 800px) {
    display: none;
  }
`;

const EnvHeader = styled.div`
  display: flex;
  cursor: pointer;
`;

const EnvMenu = styled.div`
  background-color: #1c2847;
  border-radius: 5px;
  padding: 5px;
  position: absolute;
  top: 30px;
  z-index: 1;
`;

const EnvLineHead = styled.div`
  display: flex;
  align-items: center;
`;

const EnvLine = styled.a<{ selected?: boolean }>`
  width: calc(125px - 20px);
  padding: 5px 10px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #e9ecff;
  cursor: pointer;
  border-radius: 5px;
  position: relative;
  text-decoration: none;
  ${(props) =>
    props.selected
      ? `
    background-color: #2A3557;
    cursor: default;
  `
      : `
    hover: {
      background-color: #343D65;
    }
  `}
`;

const EnvTag = styled.div`
  position: absolute;
  border-radius: 2px;
  padding: 3px 5px;
  font-size: 12px;
  color: #13203d;
  bottom: -20px;
  left: 0px;
  display: flex;
`;

const HoverEnv = styled.div`
  position: absolute;
  background-color: #1c2847;
  padding: 10px 15px;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px -1px,
    rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;
  width: 170px;
  right: -215px;
  bottom: -20px;
`;

export default function EnvDropdown(): JSX.Element {
  const [hoverAlpha, setHoverAlpha] = useState(false);
  const [hoverPlayground, setHoverPlayground] = useState(false);
  const [envDropIsOpen, setEnvDropIsOpen] = useState(false);

  return (
    <Container style={{ marginLeft: 15 }}>
      <EnvHeader onClick={() => setEnvDropIsOpen(!envDropIsOpen)}>
        <img
          src={"/assets/logo-letter.svg"}
          width={59}
          style={{ marginBottom: 10 }}
          alt="Sismo letter logo"
        />
        <Icon
          name="arrowDown-outline-white"
          style={{
            marginLeft: 20,
            transition: "all 0.4s",
            transform: envDropIsOpen ? "rotate(-180deg)" : "",
          }}
        />
      </EnvHeader>
      {envDropIsOpen && (
        <EnvMenu>
          <EnvLine
            onMouseEnter={() => setHoverAlpha(true)}
            onMouseLeave={() => setHoverAlpha(false)}
            selected={env.name === "PROD"}
            href={
              env.name === "PROD"
                ? null
                : "https://app.sismo.io" +
                  window.location.pathname +
                  window.location.search
            }
            target="_blank"
            onClick={() => setEnvDropIsOpen(false)}
          >
            <EnvLineHead>
              <Icon name="sismo-outline-white" style={{ marginRight: 5 }} />
              Main
            </EnvLineHead>
            {env.name !== "PROD" && (
              <Icon name="externalLink-outline-white" style={{ width: 13 }} />
            )}
            {hoverAlpha && (
              <HoverEnv>
                Curated environment for vetted Badges (Polygon)
              </HoverEnv>
            )}
          </EnvLine>
          <EnvLine
            onClick={() => setEnvDropIsOpen(false)}
            onMouseEnter={() => setHoverPlayground(true)}
            onMouseLeave={() => setHoverPlayground(false)}
            selected={env.name === "PLAYGROUND"}
            href={
              env.name === "PLAYGROUND"
                ? null
                : "https://playground.sismo.io" +
                  window.location.pathname +
                  window.location.search
            }
            target="_blank"
          >
            <EnvLineHead>
              <Icon
                name="playground-outline-green"
                style={{ marginRight: 5 }}
              />
              Playground
            </EnvLineHead>
            {env.name !== "PLAYGROUND" && (
              <Icon name="externalLink-outline-white" style={{ width: 13 }} />
            )}
            {hoverPlayground && (
              <HoverEnv>
                Permissionless environment for builders (Polygon)
              </HoverEnv>
            )}
          </EnvLine>
        </EnvMenu>
      )}
      {env.name === "PLAYGROUND" && !envDropIsOpen && (
        <EnvTag style={{ backgroundColor: "#a0f2e0" }}>
          <Icon name="playground-outline-blue" style={{ marginRight: 5 }} />
          Playground
        </EnvTag>
      )}
    </Container>
  );
}
