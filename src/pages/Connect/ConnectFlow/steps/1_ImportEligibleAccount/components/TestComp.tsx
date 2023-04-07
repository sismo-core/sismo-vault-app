import styled from "styled-components";

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
import { AuthSelect } from "./AuthSelect";

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

const AuthList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const AuthItem = styled.div<{ isEligible: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${(props) =>
    props.isEligible ? props.theme.colors.green1 : props.theme.colors.blue0};
`;

const ClaimList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

type Props = {
  selectedSismoConnectRequest: SelectedSismoConnectRequest;
  groupMetadataClaimRequestEligibilities: GroupMetadataClaimRequestEligibility[];
  authRequestEligibilities: AuthRequestEligibility[];
  onUserInput: (
    selectedSismoConnectRequest: SelectedSismoConnectRequest
  ) => void;
};

export function TestComp({
  selectedSismoConnectRequest,
  groupMetadataClaimRequestEligibilities,
  authRequestEligibilities,
  onUserInput,
}: Props) {
  function onAuthChange(
    authRequestEligibility: AuthRequestEligibility,
    accountIdentifier: string
  ) {
    const newSelectedSismoConnectRequest = {
      ...selectedSismoConnectRequest,
      selectedAuths: selectedSismoConnectRequest.selectedAuths.map((auth) => {
        if (auth.uuid === authRequestEligibility.auth.uuid) {
          return {
            ...auth,
            selectedUserId: accountIdentifier,
          };
        } else {
          return auth;
        }
      }),
    };
    onUserInput(newSelectedSismoConnectRequest);
  }

  return (
    <Container>
      <div>AUTH: </div>
      <AuthList>
        {authRequestEligibilities?.map((authRequestEligibility, index) => (
          <AuthSelect
            key={index + "/Auth"}
            selectedSismoConnectRequest={selectedSismoConnectRequest}
            authRequestEligibility={authRequestEligibility}
            onAuthChange={onAuthChange}
          />
        ))}
      </AuthList>

      <div style={{ marginTop: 20 }}>CLAIM: </div>
      <ClaimList>
        {groupMetadataClaimRequestEligibilities?.map(
          (claimRequestEligibility, index) => {
            const claimType = claimRequestEligibility?.claim?.claimType;
            const requestedValue = claimRequestEligibility?.claim?.value;

            const isClaimEligible = claimRequestEligibility?.isEligible;

            <GroupItem isEligible={isClaimEligible}>
              <CheckCircle
                size={16}
                color={isClaimEligible ? "#A0F2E0" : "#323E64"}
              />

              {getHumanReadableGroupName(
                claimRequestEligibility?.groupMetadata?.name
              )}
              {claimType === ClaimType.GTE && requestedValue > 1 ? (
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
            </GroupItem>;
          }
        )}
      </ClaimList>

      {/* {groupMetadataDataRequestEligibilities.length > 0 &&
        groupMetadataDataRequestEligibilities?.map(
          (dataRequestEligibility, index) => {
            const claimType =
              dataRequestEligibility?.claimRequestEligibility?.claimRequest
                ?.claimType;
            const requestedValue =
              dataRequestEligibility?.claimRequestEligibility?.claimRequest
                ?.value;

            const isClaimEligible =
              dataRequestEligibility?.claimRequestEligibility?.accountData &&
              Object?.keys(
                dataRequestEligibility?.claimRequestEligibility?.accountData
              )?.length
                ? true
                : false;

            const isAuthEligible =
              dataRequestEligibility?.authRequestEligibility?.accounts?.length >
              0;

            const authType =
              dataRequestEligibility?.authRequestEligibility?.authRequest
                ?.authType;

            const humanReadableType =
              authType === AuthType.EVM_ACCOUNT
                ? "Ethereum account"
                : authType === AuthType.GITHUB
                ? "Github account"
                : authType === AuthType.TWITTER
                ? "Twitter account"
                : authType === AuthType.ANON
                ? "Vault user id"
                : null;

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
                {dataRequestEligibility?.claimRequestEligibility?.claimRequest
                  ?.claimType !== ClaimType.EMPTY && (
                  <GroupItem isEligible={isClaimEligible}>
                    <CheckCircle
                      size={16}
                      color={isClaimEligible ? "#A0F2E0" : "#323E64"}
                    />

                    {getHumanReadableGroupName(
                      dataRequestEligibility?.claimRequestEligibility
                        ?.groupMetadata?.name
                    )}
                    {claimType === ClaimType.GTE && requestedValue > 1 ? (
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
                  </GroupItem>
                )}
                {dataRequestEligibility?.authRequestEligibility?.authRequest
                  ?.authType !== AuthType.EMPTY && (
                  <GroupItem isEligible={isAuthEligible}>
                    <CheckCircle
                      size={16}
                      color={isAuthEligible ? "#A0F2E0" : "#323E64"}
                    />

                    {humanReadableType}
                  </GroupItem>
                )}
              </div>
            );
          }
        )} */}
    </Container>
  );
}
