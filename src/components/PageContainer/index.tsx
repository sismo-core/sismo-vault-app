import { ReactNode, useEffect, useState } from "react";
import styled from "styled-components";

const Container = styled.div<{ scrollbarWidth: number }>`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 100px);
  padding: 0px 60px;
  padding-right: ${(props) => 60 - props.scrollbarWidth}px;
  @media (max-width: 800px) {
    padding: 0px 10px;
    padding-right: ${(props) => 10 - props.scrollbarWidth}px;
  }
`;

type Props = {
  children: ReactNode;
  ignoreScrollBar?: boolean;
};

export default function PageContainer({ ignoreScrollBar, children }: Props): JSX.Element {
  const [scrollbarWidth, setScrollbarWidth] = useState(null);

  useEffect(() => {
    if (ignoreScrollBar) return;
    function resizeHandler() {
      setScrollbarWidth(window.innerWidth - window.visualViewport.width);
    }
    window.visualViewport.addEventListener("resize", resizeHandler);
    return () => window.visualViewport.removeEventListener("resize", resizeHandler);
  }, [ignoreScrollBar]);

  return <Container scrollbarWidth={scrollbarWidth}>{children}</Container>;
}
