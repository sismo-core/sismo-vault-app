import styled from "styled-components";
import Icon from "../Icon";

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Step = styled.div<{ current: boolean; success: boolean }>`
  font-size: 14px;
  display: flex;
  align-items: center;
  color: #6771a9;

  ${(props) =>
    props.current &&
    `
    color: #D0D7FB;
  `}

  ${(props) =>
    props.success &&
    `
    color: #A0F2E0;
  `}
`;

const Circle = styled.div<{ current: boolean; success: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;

  height: 13px;
  width: 13px;
  border-radius: 13px;
  margin-right: 10px;
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
`;

type ValidationStepsProps = {
  steps: string[];
  currentStep: number;
  style?: React.CSSProperties;
};

export default function ValidationSteps({
  steps,
  currentStep,
  style,
}: ValidationStepsProps): JSX.Element {
  return (
    <Container style={style}>
      {steps.map((step, index) => (
        <Step
          key={step}
          current={currentStep === index + 1}
          success={currentStep > index + 1}
          style={{ marginBottom: 15 }}
        >
          <Circle
            current={currentStep === index + 1}
            success={currentStep > index + 1}
          >
            <Icon name="check-outline-blue" style={{ width: 11 }} />
          </Circle>
          {step}
        </Step>
      ))}
    </Container>
  );
}
