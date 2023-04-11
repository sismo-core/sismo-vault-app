import { Check } from "phosphor-react";
import styled from "styled-components";
import colors from "../../../../theme/colors";

const Container = styled.div<{ isDisabled: boolean }>`
  display: flex;
  align-items: center;
  cursor: ${(props) => (props.isDisabled ? "default" : "pointer")};
`;

const ToggleContainer = styled.div<{ value: boolean; isDisabled: boolean }>`
  background-color: #e2c488;
  border-radius: 34px;
  height: 20px;
  width: 40px;
  border-radius: 15px;
  z-index: 1;
  position: relative;
  transition: background-color 150ms ease;
  ${(props) =>
    props.value && !props.isDisabled
      ? `
        background-color: ${props.theme.colors.green1};
  `
      : `
        background-color: ${props.theme.colors.blue3};
  `}
  ${(props) =>
    props.isDisabled &&
    ` 
        background-color: ${props.theme.colors.blue7};
  `}
`;

const Circle = styled.div<{ value: boolean }>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.theme.colors.blue11};
  width: 16px;
  height: 16px;
  border-radius: 15px;
  top: calc(50% - 8px);
  left: 22px;

  ${(props) =>
    !props.value &&
    `
    transform: translate(-20px);
  `}
  transition: transform 150ms ease;
  z-index: 2;
`;

type ToggleProps = {
  value: boolean;
  isDisabled?: boolean;
  onChange: (value: boolean) => void;
};

export default function Toggle({
  onChange,
  value,
  isDisabled,
}: ToggleProps): JSX.Element {
  return (
    <Container
      onClick={() => !isDisabled && onChange(!value)}
      isDisabled={isDisabled}
    >
      <ToggleContainer value={value} isDisabled={isDisabled}>
        <Circle value={value}>
          {value && <Check size={12} weight="bold" color={colors.green1} />}
        </Circle>
      </ToggleContainer>
    </Container>
  );
}
