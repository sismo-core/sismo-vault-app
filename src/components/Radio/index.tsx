import styled from "styled-components";

const Container = styled.div<{
  isSelected: boolean;
  isDisabled: boolean;
}>`
  ${(props) =>
    props.isSelected
      ? ` 
  height: 8px;
  width: 8px;
  border: 5px solid ${props.theme.colors.blue2};
  background: ${props.theme.colors.blue11};

  @media (max-width: 1550px) {
    height: 6px;
    width: 6px;
} 

  `
      : `
  height: 12px;
  width: 12px;
  border: 3px solid ${props.theme.colors.blue6};
  background: ${props.theme.colors.blue11};

  @media (max-width: 1550px) {
    height: 10px;
    width: 10px;
  }
  `}

  border-radius: 30px;

  ${(props) =>
    !props.isDisabled &&
    `
    cursor: pointer;
  `}
`;

type CheckBoxProps = {
  isSelected: boolean;
  isDisabled?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
};

export default function Radio({
  isSelected,
  style,
  isDisabled = false,
  onClick,
}: CheckBoxProps): JSX.Element {
  return (
    <Container
      isSelected={isSelected}
      isDisabled={isDisabled}
      style={style}
      onClick={onClick}
    ></Container>
  );
}
