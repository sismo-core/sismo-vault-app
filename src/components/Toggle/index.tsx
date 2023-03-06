import styled from "styled-components";

const Container = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const ToggleContainer = styled.div<{ value: boolean }>`
  background-color: #e2c488;
  border-radius: 34px;
  height: 20px;
  width: 40px;
  border-radius: 15px;
  z-index: 1;
  position: relative;
  transition: background-color 300ms ease;
  ${(props) =>
    props.value
      ? `
        background-color: ${props.theme.colors.green1};
  `
      : `
        background-color: ${props.theme.colors.blue6};
  `}
`;

const Circle = styled.div<{ value: boolean }>`
  position: absolute;
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
  transition: transform 200ms ease;
  z-index: 2;
`;

type ToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
};

export default function Toggle({ onChange, value }: ToggleProps): JSX.Element {
  return (
    <Container onClick={() => onChange(!value)}>
      <ToggleContainer value={value}>
        <Circle value={value} />
      </ToggleContainer>
    </Container>
  );
}
