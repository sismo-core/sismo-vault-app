import styled from "styled-components";
import colors from "../../../../theme/colors";
import { GroupMetadata } from "../../../../libs/sismo-client";
import { ClaimType } from "../../../../libs/sismo-client/sismo-connect-prover/sismo-connect-v1";
import { Info } from "phosphor-react";

const OuterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
`;

const Container = styled.div<{ color: string }>`
  font-family: ${(props) => props.theme.fonts.medium};
  font-size: 14px;
  line-height: 20px;
  color: ${(props) => props.color};
  padding: 2px 8px;
  background: ${(props) => props.theme.colors.blue9};
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
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

type Props = {
  claimType: ClaimType;
  requestedValue: number;
  groupMetadata: GroupMetadata;
  optIn?: boolean;

  onModal?: (id: string) => void;
};

export default function ShardTag({
  groupMetadata,
  claimType,
  requestedValue,
  optIn = true,
  onModal,
}: Props) {
  const color = !optIn ? colors.blue3 : colors.blue0;

  const humanReadableGroupName = groupMetadata?.name
    ?.replace(/-/g, " ")
    .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));

  return (
    <OuterContainer>
      <Container color={color}>
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
      </Container>
      <InfoWrapper onClick={() => onModal(groupMetadata.id)}>
        <Info size={16} color={color} />
      </InfoWrapper>
    </OuterContainer>
  );
}
