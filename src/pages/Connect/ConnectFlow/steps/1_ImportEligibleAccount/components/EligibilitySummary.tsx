import styled from "styled-components";
import { ZkConnectRequest, ClaimType } from "../../../../localTypes";
import { RequestGroupMetadata } from "../../../../../../libs/sismo-client/zk-connect-prover/zk-connect-v1";
import { CheckCircle } from "phosphor-react";
import { getHumanReadableGroupName } from "../../../../utils/getHumanReadableGroupName";

const Container = styled.div`
  align-self: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 260px;

  @media (max-width: 900px) {
    width: 100%;
  }
`;

const GroupItem = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 8px;
  gap: 8px;
  font-size: 14px;
  line-height: 20px;
  font-family: ${(props) => props.theme.fonts.medium};
`;

const OrSperator = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Line = styled.div`
  height: 1px;
  width: 100%;
  background: ${(props) => props.theme.colors.blue9};
`;

const OrText = styled.div`
  font-size: 14px;
  line-height: 20px;
  font-family: ${(props) => props.theme.fonts.medium};
`;

const ValueComparator = styled.div`
  padding: 0px 6px;
  height: 18px;
  background: ${(props) => props.theme.colors.blue9};
  border-radius: 20px;
  font-size: 12px;
  line-height: 18px;
  font-family: ${(props) => props.theme.fonts.medium};

  padding: 0px 6px;
  border-radius: 20px;
  word-wrap: none;
`;

type Props = {
  zkConnectRequest: ZkConnectRequest;
  requestGroupsMetadata: RequestGroupMetadata[];
};

export function EligibilitySummary({
  zkConnectRequest,
  requestGroupsMetadata,
}: Props) {
  const isOr = zkConnectRequest?.requestContent?.operators[0] === "OR";

  return (
    <Container>
      {requestGroupsMetadata.map((group, index) => {
        const claimType = group?.claim?.claimType;
        const requestedValue = group?.claim?.value;

        return (
          <>
            {index > 0 && isOr && (
              <OrSperator>
                <Line />
                <OrText>OR</OrText>
                <Line />
              </OrSperator>
            )}
            {index > 0 && !isOr && (
              <OrSperator>
                <Line />
              </OrSperator>
            )}
            <GroupItem key={index + "/eligibilitySummary"}>
              <CheckCircle size={16} color={"#323E64"} />
              {getHumanReadableGroupName(group?.groupMetadata?.name)}
              {claimType === ClaimType.GT ? (
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
            </GroupItem>
          </>
        );
      })}
    </Container>
  );
}
