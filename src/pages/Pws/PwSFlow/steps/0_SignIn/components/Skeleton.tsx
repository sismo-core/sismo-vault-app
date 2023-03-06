import styled, { keyframes } from "styled-components";

export const SkeletonLoading = keyframes`
  from {
    background-position-x: 0%;
  }
  to {
    background-position-x: -200%;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48px;

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
`;

export default function Skeleton() {
  return (
    <Container>
      <svg
        version="1.1"
        id="Calque_1"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        viewBox="0 0 470 345"
        enableBackground="new 0 0 470 345"
        xmlSpace="preserve"
        width={470}
      >
        <clipPath id="svgClipPathID">
          <path d="M93,0h23c2.8,0,5,2.2,5,5v6c0,2.8-2.2,5-5,5H93c-2.8,0-5-2.2-5-5V5C88,2.2,90.2,0,93,0z" />
          <path d="M83.5,20h42c2.8,0,5,2.2,5,5v6c0,2.8-2.2,5-5,5h-42c-2.8,0-5-2.2-5-5v-6C78.5,22.2,80.7,20,83.5,20z" />
          <path d="M204.5,0h44c2.8,0,5,2.2,5,5v6c0,2.8-2.2,5-5,5h-44c-2.8,0-5-2.2-5-5V5C199.5,2.2,201.7,0,204.5,0z" />
          <path d="M205.5,20h42c2.8,0,5,2.2,5,5v6c0,2.8-2.2,5-5,5h-42c-2.8,0-5-2.2-5-5v-6C200.5,22.2,202.7,20,205.5,20z" />
          <path d="M315.5,0h71c2.8,0,5,2.2,5,5v6c0,2.8-2.2,5-5,5h-71c-2.8,0-5-2.2-5-5V5C310.5,2.2,312.7,0,315.5,0z" />
          <path d="M330,20h42c2.8,0,5,2.2,5,5v6c0,2.8-2.2,5-5,5h-42c-2.8,0-5-2.2-5-5v-6C325,22.2,327.2,20,330,20z" />
          <path
            d="M102,44L102,44c13,0,23.5,10.5,23.5,23.5l0,0c0,13-10.5,23.5-23.5,23.5l0,0c-13,0-23.5-10.5-23.5-23.5l0,0
	C78.5,54.5,89,44,102,44z"
          />
          <path d="M142,65h45c1.4,0,2.5,1.1,2.5,2.5l0,0c0,1.4-1.1,2.5-2.5,2.5h-45c-1.4,0-2.5-1.1-2.5-2.5l0,0C139.5,66.1,140.6,65,142,65z" />
          <path
            d="M227,44L227,44c13,0,23.5,10.5,23.5,23.5l0,0c0,13-10.5,23.5-23.5,23.5l0,0c-13,0-23.5-10.5-23.5-23.5l0,0
	C203.5,54.5,214,44,227,44z"
          />
          <path d="M267,65h45c1.4,0,2.5,1.1,2.5,2.5l0,0c0,1.4-1.1,2.5-2.5,2.5h-45c-1.4,0-2.5-1.1-2.5-2.5l0,0C264.5,66.1,265.6,65,267,65z" />
          <path
            d="M352,44L352,44c13,0,23.5,10.5,23.5,23.5l0,0c0,13-10.5,23.5-23.5,23.5l0,0c-13,0-23.5-10.5-23.5-23.5l0,0
	C328.5,54.5,339,44,352,44z"
          />
          <path d="M70,139h330c2.8,0,5,2.2,5,5v12c0,2.8-2.2,5-5,5H70c-2.8,0-5-2.2-5-5v-12C65,141.2,67.2,139,70,139z" />
          <path d="M172,165h126c2.8,0,5,2.2,5,5v14c0,2.8-2.2,5-5,5H172c-2.8,0-5-2.2-5-5v-14C167,167.2,169.2,165,172,165z" />
          <path d="M201,209h68c2.8,0,5,2.2,5,5v10c0,2.8-2.2,5-5,5h-68c-2.8,0-5-2.2-5-5v-10C196,211.2,198.2,209,201,209z" />
          <path d="M238,277h118c2.8,0,5,2.2,5,5v8c0,2.8-2.2,5-5,5H238c-2.8,0-5-2.2-5-5v-8C233,279.2,235.2,277,238,277z" />
          <path d="M114,305h242c2.8,0,5,2.2,5,5v30c0,2.8-2.2,5-5,5H114c-2.8,0-5-2.2-5-5v-30C109,307.2,111.2,305,114,305z" />
        </clipPath>
      </svg>
    </Container>
  );
}
