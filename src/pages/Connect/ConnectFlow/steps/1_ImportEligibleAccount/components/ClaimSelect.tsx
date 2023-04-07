import styled from "styled-components";
import { useState, useEffect } from "react";

import { CheckCircle } from "phosphor-react";
import { getHumanReadableGroupName } from "../../../../utils/getHumanReadableGroupName";
import {
  AuthType,
  ClaimType,
  RequestGroupMetadata,
  SelectedSismoConnectRequest,
  GroupMetadataClaimRequestEligibility,
  AuthRequestEligibility,
} from "../../../../../../libs/sismo-client/sismo-connect-prover/sismo-connect-v1";
import { BigNumber } from "ethers";

const GroupItem = styled.div<{ isEligible: boolean }>`
  height: 40px;
  display: flex;
  align-items: center;
  padding: 4px 8px;
  gap: 8px;
  font-size: 14px;
  line-height: 20px;
  font-family: ${(props) => props.theme.fonts.medium};
  color: ${(props) =>
    props.isEligible ? props.theme.colors.green1 : props.theme.colors.blue0};
`;

const ValueComparator = styled.div<{ isEligible: boolean }>`
  padding: 0px 6px;
  height: 18px;
  background: ${(props) =>
    props.isEligible ? props.theme.colors.green1 : props.theme.colors.blue9};
  color: ${(props) =>
    props.isEligible ? props.theme.colors.blue11 : props.theme.colors.blue0};
  border-radius: 20px;
  font-size: 12px;
  line-height: 18px;
  font-family: ${(props) => props.theme.fonts.medium};

  padding: 0px 6px;
  border-radius: 20px;
  word-wrap: none;
`;

type Props = {
  selectedSismoConnectRequest: SelectedSismoConnectRequest;
  groupMetadataClaimRequestEligibility: GroupMetadataClaimRequestEligibility;
  onClaimChange: (
    groupMetadataClaimRequestEligibility: GroupMetadataClaimRequestEligibility,
    selectedValue: number
  ) => void;
};

export function ClaimSelect({
  selectedSismoConnectRequest,
  groupMetadataClaimRequestEligibility,
  onClaimChange,
}: // groupMetadataDataRequestEligibilities,
Props) {
  const [valueSelected, setValueSelected] = useState<number | null>(null);

  function onChange(
    groupMetadataClaimRequestEligibility: GroupMetadataClaimRequestEligibility,
    selectedValue: number
  ) {
    setValueSelected(selectedValue);
    onClaimChange(groupMetadataClaimRequestEligibility, selectedValue);
  }

  useEffect(() => {
    const selectedValue = selectedSismoConnectRequest.selectedClaims.find(
      (claim) =>
        claim.uuid === groupMetadataClaimRequestEligibility?.claim?.uuid
    )?.selectedValue;

    setValueSelected(selectedValue);
    onClaimChange(groupMetadataClaimRequestEligibility, selectedValue);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupMetadataClaimRequestEligibility]);

  const isClaimEligible = groupMetadataClaimRequestEligibility?.isEligible;
  const claimType = groupMetadataClaimRequestEligibility?.claim?.claimType;
  const requestedValue = groupMetadataClaimRequestEligibility?.claim?.value;

  const minValue =
    isClaimEligible && groupMetadataClaimRequestEligibility?.claim?.value;
  const maxValue =
    isClaimEligible &&
    BigNumber.from(
      groupMetadataClaimRequestEligibility?.accountData?.value
    ).toNumber();

  const isOptional = groupMetadataClaimRequestEligibility?.claim?.isOptional;

  const selectableValues =
    isClaimEligible &&
    groupMetadataClaimRequestEligibility?.claim?.claimType === ClaimType.GTE
      ? Array.from({ length: maxValue - minValue + 1 }, (_, i) => i + minValue)
      : [minValue];

  return (
    <GroupItem isEligible={isClaimEligible}>
      {isOptional && <div>(optional)</div>}
      <CheckCircle size={16} color={isClaimEligible ? "#A0F2E0" : "#323E64"} />
      {getHumanReadableGroupName(
        groupMetadataClaimRequestEligibility?.groupMetadata?.name
      )}
      {claimType === ClaimType.GTE ? (
        <ValueComparator isEligible={isClaimEligible}>
          {">="} {requestedValue}
        </ValueComparator>
      ) : claimType === ClaimType.GT ? (
        <ValueComparator isEligible={isClaimEligible}>
          {">"} {requestedValue}
        </ValueComparator>
      ) : claimType === ClaimType.EQ ? (
        <ValueComparator isEligible={isClaimEligible}>
          {requestedValue}
        </ValueComparator>
      ) : claimType === ClaimType.LT ? (
        <ValueComparator isEligible={isClaimEligible}>
          {"<"} {requestedValue}
        </ValueComparator>
      ) : claimType === ClaimType.LTE ? (
        <ValueComparator isEligible={isClaimEligible}>
          {"<="} {requestedValue}
        </ValueComparator>
      ) : null}

      {isClaimEligible && (
        <select
          value={valueSelected}
          onChange={(e) =>
            onChange(
              groupMetadataClaimRequestEligibility,
              Number(e.target.value)
            )
          }
          disabled={
            !isClaimEligible ||
            !groupMetadataClaimRequestEligibility?.claim?.isSelectableByUser
          }
        >
          {selectableValues.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      )}
    </GroupItem>
  );
}
