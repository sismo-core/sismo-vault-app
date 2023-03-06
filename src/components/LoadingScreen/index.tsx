import { useEffect, useRef } from "react";
import styled from "styled-components";
import * as animationData from "./ziki-run.json";
import lottie, { AnimationItem } from "lottie-web";

const Container = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(285.51deg, #193970 -75.32%, #12203d 76.45%);
  z-index: 1000000000;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Content = styled.div`
  color: ${(props) => props.theme.colors.blue0};
  font-size: 16px;
  display: flex;
  align-items: center;
  flex-direction: column;
`;

export default function LoadingScreen(): JSX.Element {
  const zikiRunElement = useRef<HTMLDivElement>(null);
  const lottieInstance = useRef<AnimationItem>();

  useEffect(() => {
    lottieInstance.current = lottie.loadAnimation({
      animationData,
      container: zikiRunElement.current,
      autoplay: true,
      loop: true,
    });
  }, []);

  return (
    <Container>
      <Content>
        <div
          ref={zikiRunElement}
          style={{
            width: 120,
            height: 120,
            marginBottom: 10,
          }}
        />
      </Content>
    </Container>
  );
}
