import { useRef, useState } from "react";
import styled from "styled-components";
import { MagnifyingGlass, X } from "phosphor-react";
import colors from "../../theme/colors";

const Input = styled.input`
  padding: 0px 5px 10px 35px;
  width: 100%;
  position: relative;
  font-family: ${(props) => props.theme.fonts.medium};
  font-size: 14px;
  color: ${(props) => props.theme.colors.blue5};
  border: none;
  border-bottom: 3px solid #343d65;
  background-color: transparent;
  box-sizing: border-box;

  :focus {
    outline: none;
    color: ${(props) => props.theme.colors.blue2};
    border-bottom: 3px solid ${(props) => props.theme.colors.blue2};
  }
  ::placeholder {
    font-family: ${(props) => props.theme.fonts.regular};
    color: ${(props) => props.theme.colors.blue5};
    font-size: 14px;
    line-height: 20px;
  }
`;

const IconWrapper = styled.div<{ isDisabled?: boolean }>`
  position: absolute;
  top: 3px;
  left: 5px;
  cursor: pointer;
  ${(props) => props.isDisabled && "pointer-events: none;"}
`;

const Container = styled.div`
  position: relative;
`;

//https://sismo-staging-hub-data.s3.eu-west-1.amazonaws.com/group-store/ziki-pass/timestamp.json

type TextInputInfoMessageType = "info" | "error" | "success";

export type TextInputInfoMessage = {
  type: TextInputInfoMessageType;
  text: string;
};

type TextInputProps = {
  onChange?: (text: string) => void;
  clearValue?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  value?: string;
  style?: React.CSSProperties;
  maxLength?: number;
};

export default function SearchInput({
  onChange,
  onBlur,
  clearValue,
  placeholder,
  style,
  value,
  maxLength,
}: TextInputProps): JSX.Element {
  const [isFocus, setIsFocus] = useState(false);
  const ref = useRef();

  return (
    <Container>
      <Input
        ref={ref}
        onChange={(e) => onChange && onChange(e.target.value)}
        onBlur={() => setIsFocus(false)}
        placeholder={placeholder}
        style={style}
        value={value}
        maxLength={maxLength}
        onFocus={() => setIsFocus(true)}
      />
      {value?.length === 0 && (
        <IconWrapper isDisabled={value?.length === 0}>
          <MagnifyingGlass size={20} color={isFocus ? colors.blue2 : colors.blue5} weight="bold" />
        </IconWrapper>
      )}
      {value?.length > 0 && (
        <IconWrapper onClick={clearValue}>
          <X size={20} color={isFocus ? colors.blue2 : colors.blue5} weight="bold" />
        </IconWrapper>
      )}
    </Container>
  );
}
