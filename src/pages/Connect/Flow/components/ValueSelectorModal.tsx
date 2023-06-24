import { BigNumber } from "ethers";
import styled from "styled-components";
import Button from "../../../../components/Button";
import BigIntSlider from "../../../../components/BigIntSlider";
import { useEffect, useState } from "react";
import { parseEther } from "ethers/lib/utils";
import { formatToEther } from "../../utils/formatToEther";
import { displayBigNumber } from "../../utils/displayBigNumber";

const Container = styled.div`
  display: flex;
  width: 400px;
  padding: 40px 30px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 40px;
  align-self: stretch;
  color: ${(props) => props.theme.colors.blue0};
  box-sizing: border-box;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Title = styled.div`
  align-self: flex-start;
  font-size: 20px;
  font-family: ${(props) => props.theme.fonts.semibold};
  line-height: 24px;
`;

const SelectorWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 24px;
`;

const SliderWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Input = styled.input<{ width: number }>`
  width: ${(props) => props.width}px;
  padding: 12px 15px;
  border: 1px solid ${(props) => props.theme.colors.blue2};
  font-size: 16px;
  font-family: ${(props) => props.theme.fonts.medium};
  line-height: 22px;
  color: ${(props) => props.theme.colors.blue0};
  border-radius: 5px;
  background-color: transparent;
  box-sizing: border-box;

  /* Chrome, Safari, Edge, Opera */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  &[type="number"] {
    -moz-appearance: textfield;
  }

  &:focus {
    outline: none;
  }
`;

const SliderLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-family: ${(props) => props.theme.fonts.medium};
  line-height: 20px;
`;

const ButtonWrapper = styled.div`
  width: 252px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledButton = styled(Button)`
  width: 100%;
`;

type Props = {
  selectedValue: BigNumber;
  minValue: BigNumber;
  maxValue: BigNumber;
  onChange: (value: BigNumber) => void;
  onClose: () => void;
  onCancel: () => void;
};

export default function ValueSelectorModal({
  selectedValue,
  minValue,
  //maxValue,
  onChange,
  onClose,
  onCancel,
}: Props): JSX.Element {
  const maxValue = BigNumber.from("43242342342342534423");
  const [value, setValue] = useState<BigNumber | null>(selectedValue);
  const [inputText, setInputText] = useState<string>();
  const isDisabled = value?.gt(maxValue) || value?.lt(minValue);
  const decimals = maxValue.gte(BigNumber.from(10).pow(18)) ? 18 : 0;

  const maxValueCharLength = !decimals
    ? maxValue.toString().length
    : maxValue.div(BigNumber.from(10).pow(18)).toString().length;

  function onSliderChange(value: BigNumber) {
    if (!value) return setValue(minValue);
    if (value.lt(minValue)) return setValue(minValue);
    if (value.gt(maxValue)) return setValue(maxValue);
    setValue(value);
  }
  function isFloat(input: string): boolean {
    return /^\d*\.?\d*$/.test(input) || /^\d+\.$/.test(input);
  }
  function isInt(input: string): boolean {
    return /^\d*$/.test(input);
  }

  useEffect(() => {
    if (!value) return setInputText(undefined);
    if (!decimals) return setInputText(value.toString());
    setInputText(formatToEther(value));
  }, [decimals, value]);

  function onInputBlur(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.value) {
      decimals
        ? setInputText(formatToEther(minValue))
        : setInputText(minValue.toString());
      setValue(minValue);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    decimals ? onWeiInputChange(e) : onIntInputChange(e);
  }

  function onIntInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      if (!isInt(e.target.value)) return;
      if (!e.target.value) return setInputText("");
      setInputText(e.target.value);
      setValue(BigNumber.from(e.target.value));
    } catch (e) {
      console.log(e);
    }
  }

  function onWeiInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      if (!e.target.value) return setInputText("");
      setInputText(e.target.value);
      if (!isFloat(e.target.value)) return;
      !e.target.value.endsWith(".") && setValue(parseEther(e.target.value));
    } catch (e) {
      console.log(e);
    }
  }

  function onConfirm() {
    onChange(BigNumber.from(value));
    onClose();
  }

  return (
    <Container>
      <Title>Set value you want to share</Title>
      <SelectorWrapper>
        <SliderWrapper>
          <BigIntSlider
            selectedValue={value}
            onChange={onSliderChange}
            minValue={minValue}
            maxValue={maxValue}
          />
          <SliderLabel>
            <div>{displayBigNumber(minValue, decimals)}</div>
            <div>{displayBigNumber(maxValue, decimals)}</div>
          </SliderLabel>
        </SliderWrapper>
        <Input
          type="text"
          value={inputText}
          onChange={onInputChange}
          onBlur={onInputBlur}
          width={
            maxValueCharLength > 2 ? 59 + (maxValueCharLength - 2) * 7 : 59
          }
        />
      </SelectorWrapper>

      <ButtonWrapper>
        <StyledButton
          isMedium
          success
          disabled={isDisabled}
          onClick={() => !isDisabled && onConfirm()}
        >
          Confirm
        </StyledButton>
        <StyledButton
          isMedium
          onClick={() => {
            onCancel();
          }}
        >
          Cancel
        </StyledButton>
      </ButtonWrapper>
    </Container>
  );
}
