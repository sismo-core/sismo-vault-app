import styled from "styled-components";
import Lottie from "react-lottie";
import { GroupMetadata } from "../..";
import colors from "../../../../theme/colors";
import animationData from "../assets/hammer.json";

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LottieWrapper = styled.div`
  position: absolute;
  top: -24px;
  right: -32px;
`;

type Props = {
  groupMetadata: GroupMetadata[];
};

export default function ShardAnimation({ groupMetadata }: Props) {
  return (
    <Container>
      {groupMetadata?.length === 1 && (
        <svg
          width="45"
          height="45"
          viewBox="0 0 17 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.508301 5.7176L8.43936 0L16.5074 5.7176L8.43936 16L0.508301 5.7176Z"
            fill={colors.purple2}
          />
        </svg>
      )}
      <LottieWrapper>
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData,
            rendererSettings: {
              preserveAspectRatio: "xMidYMid slice",
            },
          }}
          height={38 * 1.1}
          width={36 * 1.1}
        />
      </LottieWrapper>
    </Container>
  );
}
