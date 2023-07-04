import { BigNumber } from "ethers";
import React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 24px;
  cursor: pointer;
`;

const ActiveBar = styled.div`
  position: absolute;
  height: 10px;
  width: 100%;
  background: linear-gradient(90deg, #a0f2e0 0%, #aad6ea 100%);
  border-radius: 30px;
  cursor: pointer;
`;

const InactiveBar = styled.div`
  position: absolute;
  height: 10px;
  width: 100%;
  background-color: ${(props) => props.theme.colors.blue6};
  border-radius: 20px;
  cursor: pointer;
`;
const ThumbInner = styled.div`
  width: 14px;
  height: 14px;
  background: linear-gradient(180deg, #dde1f3 0%, rgba(221, 225, 243, 0) 100%);
  border-radius: 50%;
`;

const StyledCursor = styled.div`
  cursor: pointer;
  position: absolute;
  top: 0;

  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${(props) => props.theme.colors.blue0};

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid ${(props) => props.theme.colors.blue2};
  cursor: pointer;

  box-sizing: border-box;
`;

type Props = {
  selectedValue: BigNumber;
  minValue: BigNumber;
  maxValue: BigNumber;
  onChange: (value: BigNumber) => void;
};

// Helper function to find the closest value in an array
function findClosestValue(arr: number[], value: number) {
  return arr.reduce((prev, curr) => {
    return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
  });
}

export default function BigIntSlider({
  selectedValue,
  minValue,
  maxValue,
  onChange,
}: Props): JSX.Element {
  const GRAIN = 1000;

  const sliderRef = useRef<HTMLDivElement>(null);
  const [, setSliderArrayValues] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const cachedSelectedValue = useRef<BigNumber>(selectedValue);

  const [sliderValue, setSliderValue] = useState(() => {
    if (!maxValue || !minValue || !selectedValue) {
      return null;
    }
    const range = maxValue.sub(minValue).lte(BigNumber.from(1))
      ? BigNumber.from(1)
      : maxValue.sub(minValue);
    return selectedValue.sub(minValue).mul(GRAIN).div(range).toNumber();
  });

  const calculateSliderValue = useCallback(
    (clientX: number) => {
      const slider = sliderRef.current;
      if (slider) {
        const rect = slider.getBoundingClientRect();
        let x = clientX - rect.left;
        let _value = Math.round(Math.max(0, Math.min((x / rect.width) * GRAIN, GRAIN)));
        const range = maxValue.sub(minValue);

        // Adding crenelation for values between 0 and 100
        if (range.lte(BigNumber.from(100))) {
          const length = range.toNumber() + 1;
          const step = GRAIN / (length - 1);
          const valuesArray = Array.from({ length }, (_, i) => {
            return Math.ceil(i * step);
          });
          _value = findClosestValue(valuesArray, _value);
          setSliderArrayValues(valuesArray);
        }

        let _selectedValue = BigNumber.from(_value).mul(range).div(GRAIN).add(minValue);
        setSliderValue(_value);
        cachedSelectedValue.current = _selectedValue;
        onChange(_selectedValue);
      }
    },
    [maxValue, minValue, onChange]
  );

  useEffect(() => {
    if (isDragging) return;
    if (!maxValue || !minValue || !selectedValue) return;
    if (cachedSelectedValue.current.eq(selectedValue)) return;
    const _selectedValue = selectedValue.lt(minValue)
      ? minValue
      : selectedValue.gt(maxValue)
      ? maxValue
      : selectedValue;

    const range = maxValue.sub(minValue).lte(BigNumber.from(1))
      ? BigNumber.from(1)
      : maxValue.sub(minValue);
    const newSliderValue = _selectedValue.sub(minValue).mul(GRAIN).div(range).toNumber();

    if (newSliderValue !== sliderValue) {
      setSliderValue(newSliderValue);
    }
  }, [maxValue, minValue, selectedValue, isDragging, cachedSelectedValue, sliderValue]);

  const handlePointerDown = useCallback(
    (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      setIsDragging(true);
      if (e instanceof MouseEvent) {
        calculateSliderValue(e.clientX);
      } else if (e.touches && e.touches.length > 0) {
        calculateSliderValue(e.touches[0].clientX);
      }
    },
    [calculateSliderValue]
  );

  const handlePointerMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      if (e instanceof MouseEvent) {
        calculateSliderValue(e.clientX);
      } else if (e.touches && e.touches.length > 0) {
        calculateSliderValue(e.touches[0].clientX);
      }
    },
    [calculateSliderValue, isDragging]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!sliderRef?.current) return;
    const sliderElement = sliderRef.current;
    //  window.addEventListener("keydown", handleKeyDown);
    sliderElement.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    sliderElement.addEventListener("touchstart", handlePointerDown);
    window.addEventListener("touchmove", handlePointerMove);
    window.addEventListener("touchend", handlePointerUp);

    return () => {
      //   window.removeEventListener("keydown", handleKeyDown);
      sliderElement.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      sliderElement.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [
    //  handleKeyDown,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isDragging,
    sliderRef,
  ]);

  return (
    <Container ref={sliderRef}>
      <InactiveBar />
      <ActiveBar style={{ width: `${sliderValue / 10}%` }} />
      <StyledCursor style={{ left: `calc(${sliderValue / 10}% - 12px)` }}>
        <ThumbInner />
      </StyledCursor>
    </Container>
  );
}
