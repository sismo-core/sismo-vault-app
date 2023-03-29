import styled from "styled-components";
import { useState } from "react";
import colors from "../../../../theme/colors";
import { GroupMetadata } from "../../../../libs/sismo-client";
import { ClaimType } from "../../localTypes";
//import { ClaimType } from "@sismo-core/zk-connect-client";

const Container = styled.div`
  font-family: ${(props) => props.theme.fonts.medium};
  font-size: 14px;
  line-height: 20px;
  color: ${(props) => props.theme.colors.blue0};
  padding: 2px 8px;
  background: ${(props) => props.theme.colors.blue9};
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
`;

const ValueComparator = styled.div`
  padding: 0px 6px;
  height: 18px;
  background: ${(props) => props.theme.colors.blue10};
  border-radius: 20px;
  font-size: 12px;
  line-height: 18px;
`;

type Props = {
  claimType: ClaimType;
  requestedValue: number;
  groupMetadata: GroupMetadata;
  onModal?: (id: string) => void;
};

export default function ShardTag({
  groupMetadata,
  claimType,
  requestedValue,
  onModal,
}: Props) {
  const humanReadableGroupName = groupMetadata?.name
    ?.replace(/-/g, " ")
    .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));

  return (
    <Container onClick={() => onModal(groupMetadata.id)}>
      <svg
        width="17"
        height="16"
        viewBox="0 0 17 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0.508301 5.7176L8.43936 0L16.5074 5.7176L8.43936 16L0.508301 5.7176Z"
          fill={colors.purple2}
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
  );
}
