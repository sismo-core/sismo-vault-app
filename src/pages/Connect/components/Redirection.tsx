import { Check } from "phosphor-react";
import styled from "styled-components";
import colors from "../../../theme/colors";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 407px;
  padding-top: 100px;
  padding-bottom: 40px;
  box-sizing: border-box;
`;

const Title = styled.div`
  font-size: 20px;
  line-height: 24px;
  font-family: ${(props) => props.theme.fonts.medium};
  color: ${(props) => props.theme.colors.blue0};
  margin-bottom: 15px;
  margin-top: 32px;
`;

const Subtitle = styled.div`
  font-size: 16px;
  line-height: 22px;
  font-family: ${(props) => props.theme.fonts.regular};
  color: ${(props) => props.theme.colors.blue3};
  margin-top: 56px;
`;

export default function Redirection() {
  return (
    <Container>
      <svg
        width="102"
        height="102"
        viewBox="0 0 102 102"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M51 101L101 62.8033L81.9005 1H20.0995L1 62.8033L51 101Z"
          fill="#5891F1"
        />
        <path
          d="M51 101L101 62.8033M51 101L1 62.8033M51 101L86.4751 60.5964M51 101L15.8111 60.5964M101 62.8033L81.9005 1M101 62.8033L86.4751 60.5964M81.9005 1H20.0995M81.9005 1L86.4751 60.5964M20.0995 1L1 62.8033M20.0995 1L86.4751 60.5964M20.0995 1L15.8111 60.5964M1 62.8033L15.8111 60.5964"
          stroke="#13203D"
          strokeWidth="1.56549"
          strokeMiterlimit="10"
        />
        <path
          d="M51 101L101 62.8033L81.9005 1H20.0995L1 62.8033L51 101Z"
          fill="url(#paint0_linear_5685_220392)"
        />
        <path
          d="M51 101L101 62.8033M51 101L1 62.8033M51 101L86.4751 60.5964M51 101L15.8111 60.5964M101 62.8033L81.9005 1M101 62.8033L86.4751 60.5964M81.9005 1H20.0995M81.9005 1L86.4751 60.5964M20.0995 1L1 62.8033M20.0995 1L86.4751 60.5964M20.0995 1L15.8111 60.5964M1 62.8033L15.8111 60.5964"
          stroke="url(#paint1_linear_5685_220392)"
          strokeWidth="1.56549"
          strokeMiterlimit="10"
        />
        <defs>
          <linearGradient
            id="paint0_linear_5685_220392"
            x1="19.83"
            y1="1"
            x2="82.7317"
            y2="77.4363"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0A101F" />
            <stop offset="1" stop-opacity="0.2" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_5685_220392"
            x1="20.5421"
            y1="1"
            x2="79.4399"
            y2="79.7929"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#588CF1" />
            <stop offset="1" stop-color="#0A101F" />
          </linearGradient>
        </defs>
      </svg>
      <Title>ZK proof generated!</Title>
      <Check size={18} weight="bold" color={colors.green1} />
      <Subtitle>Redirecting...</Subtitle>
    </Container>
  );
}
