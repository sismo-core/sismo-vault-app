import styled from "styled-components";
import Icon from "../Icon";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  height: 65px;
  position: fixed;

  @media (max-width: 750px) {
    display: none;
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
`;

const Right = styled.div`
  font-size: 10px;
  color: #ffffff;

  @media (max-width: 600px) {
    display: none;
  }
`;

const LinkText = styled.a`
  color: white;
  text-decoration: none;
  font-size: 12px;
`;

const Link = styled.a`
  display: flex;
  align-items: center;
`;

export default function Bottom(): JSX.Element {
  return (
    <Container>
      <Left>
        <Link
          href="https://twitter.com/sismo_eth"
          target="_blank"
          rel="noreferrer"
          style={{ marginRight: 15 }}
        >
          <Icon name="logoTwitter-fill-white" />
        </Link>
        <Link
          href="https://github.com/sismo-core"
          target="_blank"
          rel="noreferrer"
          style={{ marginRight: 15 }}
        >
          <Icon name="logoGithub-fill-white" />
        </Link>
        <Link
          href="https://discord.gg/uAPtsfNrve"
          rel="noreferrer"
          target="_blank"
        >
          <Icon name="logoDiscord-fill-white" />
        </Link>
        <LinkText
          href="https://docs.sismo.io/sismo-docs/user-faq"
          rel="noreferrer"
          target="_blank"
          style={{ marginLeft: 15 }}
        >
          FAQ
        </LinkText>
        <LinkText
          href="https://docs.sismo.io/"
          rel="noreferrer"
          target="_blank"
          style={{ marginLeft: 15 }}
        >
          Docs
        </LinkText>
      </Left>
      <Right>© 2022 Sismo.io All rights reserved.</Right>
    </Container>
  );
}
