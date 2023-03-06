import { ReactNode, useEffect, useState } from "react";
import styled from "styled-components";

const Container = styled.span`
  position: relative;
  display: flex;
  align-items: center;
  width: fit-content;
  @media (max-width: 800px) {
    justify-content: center;
  }
`;

const Icon = styled.div`
  cursor: pointer;
`;

const Box = styled.span<{
  displayNone: boolean;
  opacity: number;
}>`
  z-index: 30;
  padding: 40px 30px;
  border-radius: 10px;
  position: absolute;
  background-color: #1f2b50;
  left: 27px;
  line-height: 150%;
  width: fit-content;
  max-width: calc(350px - 60px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px -1px,
    rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;

  color: #e9ecff;
  font-size: 14px;

  transition: all 0.3s;
  ${(props) => props.displayNone && "display: none;"}
  ${(props) =>
    props.opacity === 1 &&
    !props.displayNone &&
    `
    opacity: 1;
    transform: translate3d(0, 0, 0);
  `}

  ${(props) =>
    props.opacity === 0 &&
    !props.displayNone &&
    `  
    opacity: 0;
    transform: translate3d(-1%, 0, 0);
  `}
  @media (max-width: 800px) {
    bottom: 29px;
    left: auto;
    align-items: center;
  }
`;

const Arrow = styled.div`
  width: 15px;
  height: 15px;
  background-color: #1f2b50;
  position: absolute;
  left: -7px;
  transform: rotate(45deg);
  @media (max-width: 800px) {
    left: auto;
    bottom: -7px;
  }
`;

const Hover = styled.div`
  position: absolute;
  left: -15px;
  height: 40px;
  width: 17px;
`;

type InfoProps = {
  children: ReactNode;
  color?: string;
  style?: React.CSSProperties;
  isOpen?: boolean;
};

export default function Info({
  children,
  isOpen,
  color,
  style,
}: InfoProps): JSX.Element {
  const [isHover, setIsHover] = useState(false);
  const [displayNone, setDisplayNone] = useState(true);
  const [opacity, setOpacity] = useState(false);

  useEffect(() => {
    if (isHover || isOpen) {
      setDisplayNone(false);
      setTimeout(() => {
        setOpacity(true);
      }, 20);
    } else {
      setOpacity(false);
      setTimeout(() => {
        setDisplayNone(true);
      }, 300);
    }
  }, [isHover, isOpen]);

  return (
    <Container
      style={style}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <Icon>
        <svg
          width="15"
          height="14"
          viewBox="0 0 15 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.18675 9.78967H7.50018V7.04339H6.81361M7.50018 4.29711H7.50705M13.6793 7.04339C13.6793 7.85485 13.5195 8.65836 13.209 9.40805C12.8984 10.1577 12.4433 10.8389 11.8695 11.4127C11.2957 11.9865 10.6145 12.4416 9.86483 12.7522C9.11515 13.0627 8.31164 13.2225 7.50018 13.2225C6.68872 13.2225 5.88521 13.0627 5.13553 12.7522C4.38584 12.4416 3.70466 11.9865 3.13087 11.4127C2.55709 10.8389 2.10193 10.1577 1.7914 9.40805C1.48087 8.65836 1.32104 7.85485 1.32104 7.04339C1.32104 5.40458 1.97206 3.8329 3.13087 2.67408C4.28968 1.51527 5.86137 0.864258 7.50018 0.864258C9.13899 0.864258 10.7107 1.51527 11.8695 2.67408C13.0283 3.8329 13.6793 5.40458 13.6793 7.04339Z"
            stroke={color ? color : "#ffffff"}
            strokeWidth="1.37314"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Icon>
      {(isHover || isOpen) && (
        <Box displayNone={displayNone} opacity={opacity ? 1 : 0}>
          <Arrow />
          <Hover />
          {children}
        </Box>
      )}
    </Container>
  );
}
