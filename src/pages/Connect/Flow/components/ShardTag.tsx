import styled, { keyframes } from "styled-components";
import colors from "../../../../theme/colors";
import {
  ClaimRequest,
  ClaimRequestEligibility,
  ClaimType,
} from "../../../../libs/sismo-connect-provers/sismo-connect-prover-v1";
import { CaretDown, Info, PencilSimple } from "phosphor-react";
import { useEffect, useRef, useState } from "react";
import useOnClickOutside from "../../../../utils/useClickOutside";
import { BigNumber } from "ethers";
import { GroupMetadata } from "../../../../libs/sismo-client";
import Modal from "../../../../components/Modal";
import ValueSelectorModal from "./ValueSelectorModal";
import { displayBigNumber } from "../../utils/displayBigNumber";
import { textShorten } from "../../../../utils/textShorten";
import HoverTooltip from "../../../../components/HoverTooltip";
import { formatEther } from "ethers/lib/utils";

const OuterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-grow: 1;
  margin-left: 4px;
`;

const Container = styled.div<{
  color: string;
  isSelectorOpenable: boolean;
  isOptional: boolean;
}>`
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
  width: ${(props) => (props.isOptional ? "255px" : "272px")};
  cursor: ${(props) => (props.isSelectorOpenable ? "pointer" : "default")};
  box-sizing: border-box;
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

const GroupName = styled.div`
  flex-grow: 1;
  ${textShorten(1)}

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

const StyledSvg = styled.svg`
  flex-shrink: 0;
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

function* bigNumberRange(
  start: BigNumber,
  end: BigNumber
): Generator<BigNumber> {
  for (let current = start; current.lte(end); current = current.add(1)) {
    yield current;
  }
}

type Props = {
  groupMetadata: GroupMetadata;
  claim: ClaimRequest;
  claimRequestEligibility: ClaimRequestEligibility;
  isSelectableByUser: boolean;
  initialValue: BigNumber;
  optIn?: boolean;
  isOptional: boolean;

  onClaimChange: (
    claimRequestEligibility: ClaimRequestEligibility,
    selectedValue: BigNumber
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
  const MAX_DISPLAYED_VALUE = 8;
  const [modalKey, setModalKey] = useState(0);
  const [selectedValue, setSelectedValue] = useState(initialValue || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const ref = useRef(null);
  useOnClickOutside(ref, () => setIsSelectorOpen(false));
  const color = !optIn ? colors.blue3 : colors.blue0;

  const requestedValue = BigNumber.from(claim?.value);
  const claimType = claim?.claimType;
  const minValue = BigNumber.from(claim?.value);
  let maxValue = BigNumber.from(0);
  let selectableValues: BigNumber[] = [];

  try {
    maxValue = BigNumber.from(claimRequestEligibility?.accountData?.value || 0);
    if (maxValue.lt(MAX_DISPLAYED_VALUE)) {
      for (let value of bigNumberRange(minValue, maxValue)) {
        selectableValues.push(value);
      }
    }
  } catch (e) {
    console.log("e", e);
  }
  const isWei = maxValue.gte(BigNumber.from(10).pow(18)) ? 18 : 0;

  const isSelectorOpenable =
    !maxValue.sub(minValue).eq(BigNumber.from(0)) &&
    isSelectableByUser &&
    Boolean(selectedValue);
  const isBigNumber = maxValue?.gt(BigNumber.from(MAX_DISPLAYED_VALUE));
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
    value: BigNumber
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
          isOptional={isOptional}
        ></Skeleton>
        <InfoWrapper onClick={() => {}}>
          <Info size={18} color={color} />
        </InfoWrapper>
      </OuterContainer>
    );
  }

  return (
    <>
      {selectedValue && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setModalKey(modalKey + 1);
          }}
        >
          <ValueSelectorModal
            key={claim.uuid + "/" + modalKey} // set the key prop
            minValue={minValue}
            maxValue={maxValue}
            onClose={() => setIsModalOpen(false)}
            onCancel={() => {
              setIsModalOpen(false);
              setTimeout(() => {
                setModalKey(modalKey + 1);
              }, 100);
            }}
            selectedValue={selectedValue}
            onChange={(value: BigNumber) => {
              onValueChange(claimRequestEligibility, value);
            }}
          />
        </Modal>
      )}
      <OuterContainer>
        <Container
          isSelectorOpenable={isSelectorOpenable}
          color={color}
          ref={ref}
          isOptional={isOptional}
          onClick={() => {
            if (isSelectorOpenable) {
              isBigNumber
                ? setIsModalOpen(true)
                : setIsSelectorOpen(!isSelectorOpen);
            }
          }}
        >
          <Left>
            <StyledSvg
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
            </StyledSvg>
            <GroupName>{humanReadableGroupName}</GroupName>

            <ValueComparator>
              {!selectedValue
                ? claimType === ClaimType.GTE
                  ? ">="
                  : claimType === ClaimType.GT
                  ? ">"
                  : claimType === ClaimType.EQ
                  ? "="
                  : claimType === ClaimType.LT
                  ? "<"
                  : claimType === ClaimType.LTE
                  ? "<="
                  : null
                : null}
              {!selectedValue && requestedValue ? (
                requestedValue.toString()
              ) : isWei ? (
                <HoverTooltip text={formatEther?.(selectedValue) || ""}>
                  {displayBigNumber({
                    input: selectedValue,
                    isWei,
                    nbDecimals: 2,
                    isCropped: true,
                  })}
                </HoverTooltip>
              ) : (
                selectedValue.toString()
              )}
            </ValueComparator>
          </Left>
          {maxValue.lte(BigNumber.from(MAX_DISPLAYED_VALUE)) && (
            <>
              {isSelectorOpenable && (
                <ChevronWrapper isSelectorOpen={isSelectorOpen}>
                  <CaretDown size={16} color={color} />
                </ChevronWrapper>
              )}
              {isSelectorOpen && (
                <SelectorContainer>
                  {selectableValues?.length > 0 &&
                    selectableValues?.map((value) => {
                      const isSelected = value.eq(selectedValue);
                      return (
                        <SelectorItem
                          key={value.toString() + "/selector" + claim.uuid}
                          isSelected={isSelected}
                          onClick={() => {
                            setIsSelectorOpen(false);
                            onValueChange(claimRequestEligibility, value);
                          }}
                        >
                          {value.toString()}
                        </SelectorItem>
                      );
                    })}
                </SelectorContainer>
              )}
            </>
          )}
          {isBigNumber && (
            <PencilSimple size={16} color={color} style={{ flexShrink: "0" }} />
          )}
        </Container>
        <InfoWrapper onClick={() => onModal(groupMetadata.id)}>
          <Info size={18} color={color} />
        </InfoWrapper>
      </OuterContainer>
    </>
  );
}
