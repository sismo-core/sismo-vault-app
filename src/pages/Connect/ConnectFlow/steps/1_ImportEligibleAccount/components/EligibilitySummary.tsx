import styled from "styled-components";
import { ZkConnectRequest, ClaimType, AuthType } from "../../../../localTypes";
import { RequestGroupMetadata } from "../../../../../../libs/sismo-client/zk-connect-prover/zk-connect-v1";
import { CheckCircle } from "phosphor-react";
import { getHumanReadableGroupName } from "../../../../utils/getHumanReadableGroupName";
import {
  ClaimRequestEligibility,
  AuthRequestEligibility,
} from "../../../../../../libs/sismo-client/zk-connect-prover/zk-connect-v2";

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

const GroupItem = styled.div<{ isEligible: boolean }>`
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
  zkConnectRequest: ZkConnectRequest;
  requestGroupsMetadata: RequestGroupMetadata[];
  claimRequestEligibilities: ClaimRequestEligibility[];
  authRequestEligibilities: AuthRequestEligibility[];
};

export function EligibilitySummary({
  zkConnectRequest,
  requestGroupsMetadata,
  claimRequestEligibilities,
  authRequestEligibilities,
}: Props) {
  const isOr = zkConnectRequest?.requestContent?.operators[0] === "OR";

  console.log("AUTHREQUEST", authRequestEligibilities);

  return (
    <Container>
      {/* {authRequestEligibilities?.length &&
        authRequestEligibilities.map((authRequestEligibility, index) => {
          const authType = authRequestEligibility?.authRequest?.authType;
          const readableAuthType =
            authType === AuthType.EVM_ACCOUNT
              ? "Ethereum"
              : authType === AuthType.GITHUB
              ? "Github"
              : authType === AuthType.TWITTER
              ? "Twitter"
              : null;

          console.log("readableAuthType", readableAuthType);

          const isEligible = Boolean(authRequestEligibility?.accounts?.length);

          return (
            <div key={index + "summaryItemAuth"}>
              {index > 0 && isOr && (
                <OrSperator>
                  <Line />
                  <OrText>or</OrText>
                  <Line />
                </OrSperator>
              )}
              {index > 0 && !isOr && (
                <OrSperator>
                  <Line />
                </OrSperator>
              )}
              <GroupItem isEligible={isEligible}>
                <CheckCircle
                  size={16}
                  color={isEligible ? "#A0F2E0" : "#323E64"}
                />
                {readableAuthType}
              </GroupItem>
            </div>
          );
        })} */}

      {requestGroupsMetadata?.length &&
        requestGroupsMetadata.map((group, index) => {
          const claimType = group?.claim?.claimType;
          const requestedValue = group?.claim?.value;

          const claimRequestEligibility = claimRequestEligibilities.find(
            (claimRequestEligibility) =>
              claimRequestEligibility?.claimRequest?.groupId ===
              group?.groupMetadata?.id
          );

          const isEligible =
            claimRequestEligibility?.accountData &&
            Object?.keys(claimRequestEligibility?.accountData)?.length
              ? true
              : false;

          return (
            <div key={index + "summaryItem"}>
              {index > 0 && isOr && (
                <OrSperator>
                  <Line />
                  <OrText>or</OrText>
                  <Line />
                </OrSperator>
              )}
              {index > 0 && !isOr && (
                <OrSperator>
                  <Line />
                </OrSperator>
              )}
              <GroupItem isEligible={isEligible}>
                <CheckCircle
                  size={16}
                  color={isEligible ? "#A0F2E0" : "#323E64"}
                />
                {getHumanReadableGroupName(group?.groupMetadata?.name)}
                {claimType === ClaimType.GTE ? (
                  <ValueComparator isEligible={isEligible}>
                    {">="} {requestedValue}
                  </ValueComparator>
                ) : claimType === ClaimType.GT ? (
                  <ValueComparator isEligible={isEligible}>
                    {">"} {requestedValue}
                  </ValueComparator>
                ) : claimType === ClaimType.EQ ? (
                  <ValueComparator isEligible={isEligible}>
                    {requestedValue}
                  </ValueComparator>
                ) : claimType === ClaimType.LT ? (
                  <ValueComparator isEligible={isEligible}>
                    {"<"} {requestedValue}
                  </ValueComparator>
                ) : claimType === ClaimType.LTE ? (
                  <ValueComparator isEligible={isEligible}>
                    {"<="} {requestedValue}
                  </ValueComparator>
                ) : null}
              </GroupItem>
            </div>
          );
        })}
    </Container>
  );
}
