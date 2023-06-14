import styled, { keyframes } from "styled-components";
import colors from "../../../../theme/colors";
import {
  ClaimRequest,
  ClaimRequestEligibility,
  ClaimType,
} from "../../../../libs/sismo-connect-provers/sismo-connect-prover-v1";
import { CaretDown, Info } from "phosphor-react";
import { useEffect, useRef, useState } from "react";
import useOnClickOutside from "../../../../utils/useClickOutside";
import { BigNumber } from "ethers";
import { GroupMetadata } from "../../../../libs/sismo-client";

const OuterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-grow: 1;
  margin-left: 4px;
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
  justify-content: space-between;
  gap: 4px;
  flex-shrink: 0;
  flex-grow: 1;
  cursor: ${(props) => (props.isSelectorOpenable ? "pointer" : "default")};
`;

export const SkeletonLoading = keyframes`
  from {
    background-position-x: 0%;
  }
  to {
    background-position-x: -200%;
  }
`;

const Skeleton = styled(Container)`
  background: linear-gradient(
    90deg,
    rgba(42, 53, 87, 0.4) 5%,
    rgba(42, 53, 87, 1) 20%,
    rgba(42, 53, 87, 1) 30%,
    rgba(42, 53, 87, 0.4) 50%
  );
  background-size: 200% 100%;
  animation: ${SkeletonLoading};
  animation-duration: 1.5s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  box-sizing: border-box;
  height: 24px;
  box-sizing: border-box;
  cursor: default;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const GroupName = styled.div<{ isOptional: boolean }>`
  max-width: ${(props) => (props.isOptional ? "155px" : "170px")};
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    max-width: 100px;
  }
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
  groupMetadata: GroupMetadata;
  claim: ClaimRequest;
  claimRequestEligibility: ClaimRequestEligibility;
  isSelectableByUser: boolean;
  initialValue: number;
  optIn?: boolean;
  isOptional: boolean;

  onClaimChange: (
    claimRequestEligibility: ClaimRequestEligibility,
    selectedValue: number
  ) => void;
  onModal?: (id: string) => void;
};

export default function ShardTag({
  groupMetadata,
  claim,
  claimRequestEligibility,
  isSelectableByUser,
  initialValue,
  optIn = true,
  isOptional,
  onClaimChange,
  onModal,
}: Props) {
  const [selectedValue, setSelectedValue] = useState(initialValue || null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const ref = useRef(null);

  useOnClickOutside(ref, () => setIsSelectorOpen(false));

  const color = !optIn ? colors.blue3 : colors.blue0;

  const requestedValue = claim?.value;
  const claimType = claim?.claimType;

  const minValue = claim?.value;

  let maxValue = 0;
  let selectableValues = [];
  try {
    maxValue = BigNumber.from(
      claimRequestEligibility?.accountData?.value || 0
    ).toNumber();
    selectableValues =
      claimRequestEligibility?.claim?.claimType === ClaimType.GTE
        ? Array.from(
            { length: maxValue - minValue + 1 },
            (_, i) => i + minValue
          )
        : [minValue];
  } catch (e) {
    console.log("e", e);
  }

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
    claimRequestEligibility: ClaimRequestEligibility,
    value: number
  ) {
    setSelectedValue(value);
    onClaimChange(claimRequestEligibility, value);
  }

  if (!groupMetadata) {
    return (
      <OuterContainer>
        <Skeleton
          isSelectorOpenable={false}
          color={color}
          ref={null}
          onClick={() => {}}
        ></Skeleton>
        <InfoWrapper onClick={() => {}}>
          <Info size={18} color={color} />
        </InfoWrapper>
      </OuterContainer>
    );
  }

  return (
    <OuterContainer>
      <Container
        isSelectorOpenable={isSelectorOpenable}
        color={color}
        ref={ref}
        onClick={() => isSelectorOpenable && setIsSelectorOpen(!isSelectorOpen)}
      >
        <Left>
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
          <GroupName isOptional={isOptional}>
            {humanReadableGroupName}
          </GroupName>

          {claimType === ClaimType.GTE ? (
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
        </Left>
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
                    onValueChange(claimRequestEligibility, value);
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
        <Info size={18} color={color} />
      </InfoWrapper>
    </OuterContainer>
  );
}
