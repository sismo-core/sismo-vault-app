import styled, { keyframes } from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 366px;
  //box-sizing: border-box;
  padding: 40px 24px;
`;

export const SkeletonLoading = keyframes`
  from {
    background-position-x: 0%;
  }
  to {
    background-position-x: -200%;
  }
`;

const Separator = styled.div`
  width: 252px;
  height: 1px;
  background: ${(props) => props.theme.colors.blue9};
  margin: 10px 0;
  box-sizing: border-box;
`;

const Wrapper = styled.div`
  justify-content: center;

  background: linear-gradient(
    90deg,
    rgba(42, 53, 87, 0.3) 5%,
    rgba(42, 53, 87, 0.6) 25%,
    rgba(42, 53, 87, 0.3) 50%
  );
  clip-path: url(#svgClipPathID);
  background-size: 200% 100%;
  animation: ${SkeletonLoading};
  animation-duration: 1.5s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  box-sizing: border-box;
`;

const TopWrapper = styled(Wrapper)`
  clip-path: url(#svgClipPathID1);
`;
const MiddleWrapper = styled(Wrapper)`
  clip-path: url(#svgClipPathID2);
`;
const BottomWrapper = styled(Wrapper)`
  clip-path: url(#svgClipPathID3);
  transform: translateY(46px);
`;

export default function Skeleton() {
  return (
    <Container>
      <TopWrapper>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          viewBox="0 0 200 178"
          enableBackground="new 0 0 200 178"
          xmlSpace="preserve"
          width={200}
          height={178}
        >
          <clipPath id="svgClipPathID1">
            <path d="M97,0h6c24.9,0,45,20.1,45,45v6c0,24.9-20.1,45-45,45h-6c-24.9,0-45-20.1-45-45v-6C52,20.1,72.1,0,97,0z" />
            <path d="M5,116h190c2.8,0,5,2.2,5,5v12c0,2.8-2.2,5-5,5H5c-2.8,0-5-2.2-5-5v-12C0,118.2,2.2,116,5,116z" />
            <path d="M52,158h96c2.8,0,5,2.2,5,5v10c0,2.8-2.2,5-5,5H52c-2.8,0-5-2.2-5-5v-10C47,160.2,49.2,158,52,158z" />
          </clipPath>
        </svg>
      </TopWrapper>
      <Separator />
      <MiddleWrapper>
        <svg
          version="1.1"
          id="Calque_1"
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          viewBox="0 0 120 24"
          enableBackground="new 0 0 120 24"
          xmlSpace="preserve"
          width={120}
          height={24}
        >
          <clipPath id="svgClipPathID2">
            <path d="M5,0h110c2.8,0,5,2.2,5,5v14c0,2.8-2.2,5-5,5H5c-2.8,0-5-2.2-5-5V5C0,2.2,2.2,0,5,0z" />
          </clipPath>
        </svg>
      </MiddleWrapper>
      <Separator />
      <BottomWrapper>
        <svg
          version="1.1"
          id="Calque_1"
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          viewBox="0 0 252 68"
          enableBackground="new 0 0 252 68"
          xmlSpace="preserve"
          width={252}
          height={68}
        >
          <clipPath id="svgClipPathID3">
            <path d="M117,0h130c2.8,0,5,2.2,5,5v8c0,2.8-2.2,5-5,5H117c-2.8,0-5-2.2-5-5V5C112,2.2,114.2,0,117,0z" />
            <path d="M5,28h242c2.8,0,5,2.2,5,5v30c0,2.8-2.2,5-5,5H5c-2.8,0-5-2.2-5-5V33C0,30.2,2.2,28,5,28z" />
          </clipPath>
        </svg>
      </BottomWrapper>
    </Container>
  );
}
