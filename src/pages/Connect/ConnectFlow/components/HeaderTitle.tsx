import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  height: 50px;
`;

const Title = styled.div`
  color: ${(props) => props.theme.colors.blue1};
  margin-bottom: 4px;
`;

const TitleLarge = styled.span`
  font-size: 35.2463px;
  line-height: 32px;
  font-family: ${(props) => props.theme.fonts.logo};
`;

const Subtitle = styled.div`
  font-size: 12px;
  line-height: 14px;
  color: ${(props) => props.theme.colors.blue3};
  font-family: ${(props) => props.theme.fonts.regular};
`;

type Props = {
  url: string;
  style?: React.CSSProperties;
};

export default function HeaderTitle({ url, style }: Props) {
  return (
    <Container style={style}>
      <Title>
        <TitleLarge>sismoConnect</TitleLarge>
      </Title>
      <Subtitle>{url}</Subtitle>
    </Container>
  );
}
