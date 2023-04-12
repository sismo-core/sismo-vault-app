import styled from "styled-components";
import colors from "../../../../theme/colors";
import { GroupMetadata } from "../../../../libs/sismo-client";
import {
  ClaimType,
  GroupMetadataClaimRequestEligibility,
} from "../../../../libs/sismo-client/sismo-connect-prover/sismo-connect-v1";
import { CaretDown, Info } from "phosphor-react";
import { useEffect, useRef, useState } from "react";
import useOnClickOutside from "../../../../utils/useClickOutside";
import { BigNumber } from "ethers";

const OuterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
`;

const Container = styled.div<{ color: string; isSelectorOpenable: boolean }>`
  position: relative;
  font-family: ${(props) => props.theme.fonts.medium};
  font-size: 14px;
  line-height: 20px;
  color: ${(props) => props.color};
  padding: 2px 8px;
  background: ${(props) => props.theme.colors.blue9};
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  cursor: ${(props) => (props.isSelectorOpenable ? "pointer" : "default")};
`;

const ValueComparator = styled.div`
  padding: 0px 6px;
  height: 18px;
  background: ${(props) => props.theme.colors.blue10};
  border-radius: 20px;
  font-size: 12px;
  line-height: 18px;
  flex-shrink: 0;
`;

const InfoWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const ChevronWrapper = styled.div<{ isSelectorOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transform: ${(props) =>
    !props.isSelectorOpen ? "rotateX(0deg)" : "rotateX(180deg)"};

  /* transition: transform 0.15s ease-in-out; */
`;

const SelectorContainer = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  top: 28px;
  right: 0;
  background-color: ${(props) => props.theme.colors.blue9};
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  z-index: 1;
  padding: 4px 6px;

  /* width: 245px; */

  box-sizing: border-box;
`;

const SelectorItem = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 20px;
  color: ${(props) =>
    props.isSelected ? props.theme.colors.green1 : props.theme.colors.blue0};
  font-family: ${(props) => props.theme.fonts.medium};
  border-radius: 2px;
  background: transparent;

  padding: 8px 6px;

  cursor: pointer;

  &:hover {
    background: ${(props) => props.theme.colors.blue7};
  }

  transition: background 0.15s ease-in-out;
`;

type Props = {
  groupMetadataClaimRequestEligibility: GroupMetadataClaimRequestEligibility;
  isSelectableByUser: boolean;
  initialValue: number;
  optIn?: boolean;

  onClaimChange: (
    groupMetadataClaimRequestEligibility: GroupMetadataClaimRequestEligibility,
    selectedValue: number
  ) => void;
  onModal?: (id: string) => void;
};

export default function ShardTag({
  groupMetadataClaimRequestEligibility,
  isSelectableByUser,
  initialValue,
  optIn = true,
  onClaimChange,
  onModal,
}: Props) {
  const [selectedValue, setSelectedValue] = useState(initialValue || null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const ref = useRef(null);

  useOnClickOutside(ref, () => setIsSelectorOpen(false));

  const color = !optIn ? colors.blue3 : colors.blue0;

  const requestedValue = groupMetadataClaimRequestEligibility?.claim?.value;
  const claimType = groupMetadataClaimRequestEligibility?.claim?.claimType;
  const groupMetadata = groupMetadataClaimRequestEligibility?.groupMetadata;

  const minValue = groupMetadataClaimRequestEligibility?.claim?.value;
  const maxValue = BigNumber.from(
    groupMetadataClaimRequestEligibility?.accountData?.value || 0
  ).toNumber();

  const selectableValues =
    groupMetadataClaimRequestEligibility?.claim?.claimType === ClaimType.GTE
      ? Array.from({ length: maxValue - minValue + 1 }, (_, i) => i + minValue)
      : [minValue];

  const isSelectorOpenable = selectableValues?.length > 1 && isSelectableByUser;

  const humanReadableGroupName = groupMetadata?.name
    ?.replace(/-/g, " ")
    .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));

  useEffect(() => {
    if (initialValue) {
      setSelectedValue(initialValue);
    }
  }, [initialValue]);

  function onValueChange(
    groupMetadataClaimRequestEligibility: GroupMetadataClaimRequestEligibility,
    value: number
  ) {
    setSelectedValue(value);
    onClaimChange(groupMetadataClaimRequestEligibility, value);
  }

  return (
    <OuterContainer>
      <Container
        isSelectorOpenable={isSelectorOpenable}
        color={color}
        ref={ref}
        onClick={() => isSelectorOpenable && setIsSelectorOpen(!isSelectorOpen)}
      >
        <svg
          width="14"
          height="15"
          viewBox="0 0 14 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.00083 0.594749L13.334 5.53932L7.00083 13.2671L0.666871 5.53933L7.00083 0.594749Z"
            fill="#C08AFF"
            stroke="#C08AFF"
            strokeWidth="0.937557"
          />
        </svg>

        {humanReadableGroupName}
        {claimType === ClaimType.GTE && requestedValue > 1 ? (
          <ValueComparator>
            {">="} {requestedValue}
          </ValueComparator>
        ) : claimType === ClaimType.GT ? (
          <ValueComparator>
            {">"} {requestedValue}
          </ValueComparator>
        ) : claimType === ClaimType.EQ ? (
          <ValueComparator>{requestedValue}</ValueComparator>
        ) : claimType === ClaimType.LT ? (
          <ValueComparator>
            {"<"} {requestedValue}
          </ValueComparator>
        ) : claimType === ClaimType.LTE ? (
          <ValueComparator>
            {"<="} {requestedValue}
          </ValueComparator>
        ) : null}
        {isSelectorOpenable && (
          <ChevronWrapper isSelectorOpen={isSelectorOpen}>
            <CaretDown size={16} color={color} />
          </ChevronWrapper>
        )}
        {isSelectorOpen && (
          <SelectorContainer>
            {selectableValues?.map((value) => {
              const isSelected = value === selectedValue;
              return (
                <SelectorItem
                  key={value}
                  isSelected={isSelected}
                  onClick={() => {
                    setIsSelectorOpen(false);
                    onValueChange(groupMetadataClaimRequestEligibility, value);
                  }}
                >
                  {value}
                </SelectorItem>
              );
            })}
          </SelectorContainer>
        )}
      </Container>
      <InfoWrapper onClick={() => onModal(groupMetadata.id)}>
        <Info size={16} color={color} />
      </InfoWrapper>
    </OuterContainer>
  );
}
