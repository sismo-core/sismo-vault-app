import styled from "styled-components";
import { Check } from "phosphor-react";
import colors from "../../theme/colors";

const Container = styled.div<{
  isChecked: boolean;
  isDisabled: boolean;
}>`
  height: 16px;
  width: 16px;
  background: ${(props) =>
    props.isDisabled
      ? props.theme.colors.blue9
      : !props.isDisabled && props.isChecked
      ? props.theme.colors.blue2
      : !props.isDisabled && !props.isChecked
      ? props.theme.colors.blue6
      : props.theme.colors.blue6};
  border-radius: 3px;

  display: flex;
  justify-content: center;
  align-items: center;
  ${(props) =>
    !props.isDisabled &&
    `
    cursor: pointer;
  `}

  @media (max-width: 1550px) {
    height: 14px;
    width: 14px;
  }
`;

const CheckWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 10px;
  height: 10px;

  @media (max-width: 1550px) {
    width: 8.75px;
    height: 8.75px;
  }
`;

type CheckBoxProps = {
  isChecked: boolean;
  isDisabled?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
};

export default function CheckBox({
  isChecked,
  style,
  isDisabled = false,
  onClick,
}: CheckBoxProps): JSX.Element {
  return (
    <Container isChecked={isChecked} isDisabled={isDisabled} style={style} onClick={onClick}>
      {isChecked && (
        <CheckWrapper>
          <Check color={colors.blue10} weight={"bold"} />
        </CheckWrapper>
      )}
    </Container>
  );
}
