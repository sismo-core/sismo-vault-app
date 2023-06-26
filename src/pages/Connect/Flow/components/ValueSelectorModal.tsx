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

const SelectorWrapper = styled.div<{ isColumn: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 24px;
  flex-direction: ${(props) => (props.isColumn ? "column" : "row")};
`;

const SliderWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Input = styled.input<{ width: number; isColumn: Boolean }>`
  width: ${(props) => (props.isColumn ? "100%" : `${props.width}px`)};
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

function isStrictFloat(input: string): boolean {
  return /^\d*\.?\d*$/.test(input);
}

function isFloat(input: string): boolean {
  return /^\d*\.?\d*$/.test(input) || /^\d+\.$/.test(input);
}
function isInt(input: string): boolean {
  return /^\d*$/.test(input);
}

export default function ValueSelectorModal({
  selectedValue,
  minValue,
  maxValue,
  onChange,
  onClose,
  onCancel,
}: Props): JSX.Element {
  const [value, setValue] = useState<BigNumber | null>(selectedValue);
  const [inputText, setInputText] = useState<string>("");
  const isDisabled =
    value?.gt(maxValue) ||
    value?.lt(minValue) ||
    !isStrictFloat(inputText) ||
    inputText.endsWith(".");
  const isWei = maxValue.gt(BigNumber.from(10).pow(18)) ? 18 : 0;

  const maxValueCharLength = !isWei
    ? maxValue.toString().length
    : maxValue.div(BigNumber.from(10).pow(18)).toString().length;

  const isColumn = Boolean(isWei) || maxValueCharLength > 4;

  function onSliderChange(value: BigNumber) {
    if (!value) return setValue(minValue);
    if (value.lt(minValue)) return setValue(minValue);
    if (value.gt(maxValue)) return setValue(maxValue);
    setValue(value);
  }

  useEffect(() => {
    try {
      if (!value) return setInputText(undefined);
      if (!isWei) return setInputText(value.toString());
      if (inputText && value.eq(BigNumber.from(parseEther(inputText)))) return;
      setInputText(formatToEther({ valueInWei: value }));
    } catch (e) {
      console.log(e);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWei, value]);

  function onInputBlur(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      if (!e.target.value) {
        isWei
          ? setInputText(formatToEther({ valueInWei: minValue }))
          : setInputText(minValue.toString());
        setValue(minValue);
      }
    } catch (e) {
      console.log(e);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    isWei ? onWeiInputChange(e) : onIntInputChange(e);
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
      if (e.target.value.split(".")[1]?.length > 18) return;
      setInputText(e.target.value);
      if (!isFloat(e.target.value)) return;
      setValue(parseEther(e.target.value));
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
      <SelectorWrapper isColumn={isColumn}>
        <SliderWrapper>
          <BigIntSlider
            selectedValue={value}
            onChange={onSliderChange}
            minValue={minValue}
            maxValue={maxValue}
          />
          <SliderLabel>
            <div>{displayBigNumber({ input: minValue, isWei })}</div>
            <div>
              {displayBigNumber({ input: maxValue, isWei, nbDecimals: 2 })}
            </div>
          </SliderLabel>
        </SliderWrapper>
        <Input
          isColumn={isColumn}
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
