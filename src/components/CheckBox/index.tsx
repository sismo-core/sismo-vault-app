import styled from "styled-components";
import Icon from "../Icon";

const Container = styled.div<{ isChecked: boolean; clickable: boolean }>`
  height: 16px;
  width: 16px;
  background: #3f4973;
  border-radius: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
  ${(props) =>
    props.clickable &&
    `
    cursor: pointer;
  `}
`;

type CheckBoxProps = {
  isChecked: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
};

export default function CheckBox({
  isChecked,
  style,
  onClick,
}: CheckBoxProps): JSX.Element {
  return (
    <Container
      isChecked={isChecked}
      style={style}
      onClick={onClick}
      clickable={Boolean(onClick)}
    >
      {isChecked && (
        <Icon name="check-outline-white" style={{ width: 12, height: 12 }} />
      )}
    </Container>
  );
}
