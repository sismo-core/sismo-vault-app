import styled from "styled-components";
import colors from "../../../../theme/colors";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  height: 111px;

  box-sizing: border-box;

  @media (max-width: 900px) {
    display: none;
  }
`;

const LeftFlex = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  height: 111px;
  text-align: right;

  box-sizing: border-box;
`;

const RightFlex = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 87.36px;

  box-sizing: border-box;
`;

const Text = styled.div<{ color: string }>`
  font-family: ${(props) => props.theme.fonts.regular};
  line-height: 18px;
  font-size: 12px;
  color: ${(props) => props.color};
`;

const CircleStep = styled.div<{ isFilled: boolean; color: string }>`
  width: 16px;
  height: 16px;

  border-radius: 50%;
  border: 1px solid ${(props) => props.color};
  background-color: ${(props) =>
    props.isFilled ? props.color : "transparent"};

  box-sizing: border-box;
`;

type Props = {
  className?: string;
  style?: React.CSSProperties;
  hostName: string;
  step: "SignIn" | "ImportEligibleAccount" | "GenerateZkProof" | "Redirecting";
};

export default function LayoutFlow({
  className,
  style,
  step,
  hostName,
}: Props) {
  return (
    <Container className={className} style={style}>
      <LeftFlex>
        <Text color={step === "Redirecting" ? colors.green1 : colors.blue1}>
          ZK Proof
          <br />
          generation
        </Text>
        <Text color={step === "Redirecting" ? colors.blue1 : colors.blue5}>
          Redirecting to
          <br />
          {hostName}
        </Text>
      </LeftFlex>

      <RightFlex>
        <CircleStep
          isFilled={true}
          color={step === "Redirecting" ? colors.green1 : colors.blue1}
        />
        <svg
          width="3"
          height="35.21"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 3 35.21"
          fill={step === "Redirecting" ? colors.blue1 : colors.blue5}
        >
          <circle cx="1.5" cy="34.61" r=".6" />
          <circle cx="1.5" cy="26.56" r="1.2" />
          <circle cx="1.5" cy="17.6" r="1.5" />
          <circle cx="1.5" cy="8.65" r="1.2" />
          <circle cx="1.5" cy=".6" r=".6" />
        </svg>
        <CircleStep
          isFilled={step === "Redirecting" ? true : false}
          color={step === "Redirecting" ? colors.blue1 : colors.blue5}
        />
      </RightFlex>
    </Container>
  );
}
