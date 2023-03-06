import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;

const Title = styled.div`
  color: ${(props) => props.theme.colors.blue1};
`;

const TitleLarge = styled.span`
  font-size: 32px;
  line-height: 32px;
  font-family: ${(props) => props.theme.fonts.logo};
`;

const TitleSmall = styled.span`
  font-size: 24px;
  line-height: 32px;
  font-family: ${(props) => props.theme.fonts.logoRegular};
`;

const Subtitle = styled.div`
  font-size: 12px;
  line-height: 14px;
  color: ${(props) => props.theme.colors.blue3};
  font-family: ${(props) => props.theme.fonts.regular};
`;

type Props = {
  url: string;
};

export default function HeaderTitle({ url }: Props) {
  return (
    <Container>
      <Title>
        <TitleLarge>PROVE</TitleLarge>
        <TitleSmall> WITH </TitleSmall>
        <TitleLarge>SISMO</TitleLarge>
      </Title>
      <Subtitle>{url}</Subtitle>
    </Container>
  );
}
