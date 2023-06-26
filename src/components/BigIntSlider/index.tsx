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

const Cursor = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_6532_145675)">
      <rect width="24" height="24" rx="12" fill="#E9ECFF" />
      <rect
        x="0.5"
        y="0.5"
        width="23"
        height="23"
        rx="11.5"
        fill="#E9ECFF"
        stroke="#B1BCF1"
      />
      <rect
        x="5.05264"
        y="5.05267"
        width="13.8947"
        height="13.8947"
        rx="6.94737"
        fill="url(#paint0_linear_6532_145675)"
      />
    </g>
    <defs>
      <linearGradient
        id="paint0_linear_6532_145675"
        x1="12"
        y1="5.05267"
        x2="12"
        y2="18.9474"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#CDD3EC" />
        <stop offset="1" stopColor="#DDE1F3" stopOpacity="0" />
      </linearGradient>
      <clipPath id="clip0_6532_145675">
        <rect width="24" height="24" rx="12" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const StyledCursor = styled.div`
  cursor: pointer;
  position: absolute;
  top: 0;
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
  const GRAIN = 100;

  const sliderRef = useRef<HTMLDivElement>(null);
  const [, setSliderArrayValues] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const cachedSelectedValue = useRef<BigNumber>(selectedValue);

  const [sliderValue, setSliderValue] = useState(() => {
    if (!maxValue || !minValue || !selectedValue) {
      return null;
    }
    const range = maxValue.sub(minValue);
    return selectedValue.sub(minValue).mul(GRAIN).div(range).toNumber();
  });

  const calculateSliderValue = useCallback(
    (clientX: number) => {
      const slider = sliderRef.current;
      if (slider) {
        const rect = slider.getBoundingClientRect();
        let x = clientX - rect.left;
        let _value = Math.round(
          Math.max(0, Math.min((x / rect.width) * GRAIN, GRAIN))
        );
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

        let _selectedValue = BigNumber.from(_value)
          .mul(range)
          .div(GRAIN)
          .add(minValue);
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

    const range = maxValue.sub(minValue);
    const newSliderValue = _selectedValue
      .sub(minValue)
      .mul(GRAIN)
      .div(range)
      .toNumber();

    if (newSliderValue !== sliderValue) {
      setSliderValue(newSliderValue);
    }
  }, [
    maxValue,
    minValue,
    selectedValue,
    isDragging,
    cachedSelectedValue,
    sliderValue,
  ]);

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
      <ActiveBar style={{ width: `calc(${sliderValue}%` }} />
      <StyledCursor style={{ left: `calc(${sliderValue}% - 12px)` }}>
        {Cursor}
      </StyledCursor>
    </Container>
  );
}
