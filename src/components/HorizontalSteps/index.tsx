import { ReactNode, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
`;

const Step = styled.div<{ current: boolean; success: boolean }>`
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const Circle = styled.div<{ current: boolean; success: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;

  height: 20px;
  width: 20px;
  border-radius: 20px;
  background-color: #6771a9;
  border: 1px #6771a9 solid;

  ${(props) =>
    props.current &&
    `
    background-color: #D0D7FB;
    border: 1px #D0D7FB solid;
  `}

  ${(props) =>
    props.success &&
    `
    background-color: #A0F2E0;
    border: 1px #A0F2E0 solid;
  `}

  font-size: 12px;
  text-align: center;
  color: #13203d;
`;

const HoverContent = styled.div`
  position: absolute;
  width: 280px;
  background-color: #1f2b50;
  color: white;
  top: 35px;
  padding: 10px;
  border-radius: 5px;
  z-index: 1;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;
`;

const Line = styled.div<{ current: boolean; success: boolean }>`
  height: 2px;
  width: 30px;
  background-color: #6771a9;

  ${(props) =>
    props.current &&
    `
    background-color: #D0D7FB;
  `}

  ${(props) =>
    props.success &&
    `
    background-color: #A0F2E0;
  `}
`;

type HorizontalStepsProps = {
  stepsHover: ReactNode[];
  currentStep: number;
  style?: React.CSSProperties;
};

export default function HorizontalSteps({
  stepsHover,
  currentStep,
  style,
}: HorizontalStepsProps): JSX.Element {
  const [stepHover, setStepHover] = useState(null);

  return (
    <Container style={style}>
      {stepsHover.map((step, index) => (
        <Step
          key={index + "HorizontalSteps"}
          current={currentStep === index + 1}
          success={currentStep > index + 1}
          style={{ marginBottom: 15 }}
        >
          <Circle
            current={currentStep === index + 1}
            success={currentStep > index + 1}
            onMouseEnter={() => setStepHover(index + 1)}
            onMouseLeave={() => setStepHover(null)}
          >
            {index + 1}
          </Circle>
          {stepHover === index + 1 && <HoverContent>{step}</HoverContent>}
          {index < stepsHover.length - 1 && (
            <Line current={currentStep === index + 1} success={currentStep > index + 1} />
          )}
        </Step>
      ))}
    </Container>
  );
}
