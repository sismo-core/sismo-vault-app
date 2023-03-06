import styled from "styled-components";
import colors from "../../theme/colors";
import fonts from "../../theme/fonts";

const TextAreaOverflow = styled.textarea<{ error: boolean }>`
  border: none;
  width: 100%;
  box-sizing: border-box;
  resize: none;
  border-radius: 5px;
  padding: 10px 15px;
  font-size: 14px;
  color: ${colors.blue0};
  line-break: anywhere;
  background: transparent;
  border: 1px solid ${(props) => (props.error ? colors.error : colors.blue2)}; //colornew
  font-family: ${fonts.regular};
  overflow: hidden;
  :focus {
    outline: none;
  }
  ::placeholder {
    color: ${colors.blue2};
    font-style: italic;
  }
`;

type TextInputInfoMessageType = "info" | "error" | "success";

export type TextInputInfoMessage = {
  type: TextInputInfoMessageType;
  text: string;
};

type Props = {
  onChange?: (text: string) => void;
  placeholder?: string;
  value?: string;
  style?: React.CSSProperties;
  error?: boolean;
};

export default function TextArea({
  onChange,
  placeholder,
  style,
  value,
  error,
}: Props): JSX.Element {
  return (
    <TextAreaOverflow
      error={error}
      onChange={(e) => onChange && onChange(e.target.value)}
      placeholder={placeholder}
      style={style}
      value={value}
      rows={3}
    />
  );
}
