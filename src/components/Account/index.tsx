import styled from "styled-components";
import Blockies from "react-blockies";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;
`;

const Center = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BlockiesContainer = styled.div<{ isBig: boolean }>`
  height: 24px;
  width: 24px;
  border-radius: 24px;
  margin-left: 2px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  ${(props) =>
    props.isBig &&
    `
    height: 32px;
    width: 32px;
    border-radius: 32px;
    margin-bottom: 2px;
  `}
`;

const Address = styled.div<{ isBig: boolean }>`
  font-size: 16px;
  line-height: 150%;
  color: #e9ecff;
  position: relative;
  text-align: center;
  ${(props) =>
    props.isBig &&
    `
    font-size: 20px;
  `}
`;

const Subtitle = styled.div<{ state?: string; isCenter: boolean }>`
  color: #d0d7fb;
  font-size: 12px;
  margin-top: -5px;
  ${(props) =>
    props.state === "error" &&
    `
    color: ${props.theme.colors.error};
  `}
  ${(props) =>
    props.state === "primary" &&
    `
    color: ${props.theme.colors.primary};
  `}
  ${(props) =>
    props.state === "success" &&
    `
    color: ${props.theme.colors.success};
  `}
  text-align: right;
  ${(props) =>
    props.isCenter &&
    `
    text-align: center;
  `}
`;

const SubtitleContainer = styled.div<{ isCenter: boolean }>`
  ${(props) =>
    !props.isCenter &&
    `
      width: 120%;
      position: absolute;
      text-align: right;
      right: 0px;
      bottom: -18px;
  `}
`;

type AccountProps = {
  address?: string;
  main?: string;
  subtitle?: string;
  state?: "error" | "primary" | "success" | null;
  style?: React.CSSProperties;
  isBig?: boolean;
  isCenter?: boolean;
};

export default function Account({
  address,
  main,
  subtitle,
  state,
  style,
  isBig,
  isCenter,
}: AccountProps): JSX.Element {
  return (
    <Container style={style}>
      <Center>
        <BlockiesContainer isBig={isBig}>
          {address && <Blockies seed={address} size={8} scale={isBig ? 4 : 3} />}
        </BlockiesContainer>
        <Address style={{ marginTop: 4 }} isBig={isBig}>
          {main}
          {Boolean(subtitle) && (
            <SubtitleContainer isCenter={isCenter}>
              <Subtitle isCenter={isCenter} state={state}>
                {subtitle}
              </Subtitle>
            </SubtitleContainer>
          )}
        </Address>
      </Center>
    </Container>
  );
}
