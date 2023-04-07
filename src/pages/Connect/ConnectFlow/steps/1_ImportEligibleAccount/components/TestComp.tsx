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
import { ClaimSelect } from "./ClaimSelect";
import { useState } from "react";

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
  gap: 10px;
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

const MessageWrapper = styled.div`
  display: flex;
  flex-direction: column;

  padding: 8px;
  gap: 10px;

  width: 360px;
  max-height: 86px;
  overflow: auto;

  background: ${(props) => props.theme.colors.blue9};
  border-radius: 5px;
  font-size: 14px;
  line-height: 20px;

  color: ${(props) => props.theme.colors.blue0};
  margin-bottom: 20px;
  box-sizing: border-box;

  @media (max-width: 900px) {
    width: 100%;
  }
`;

const MessageTitle = styled.div`
  font-family: ${(props) => props.theme.fonts.bold};
`;

const Message = styled.textarea`
  font-family: ${(props) => props.theme.fonts.medium};
  word-break: break-all;
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
  const [message, setMessage] = useState<string>(
    selectedSismoConnectRequest?.selectedSignature?.selectedMessage || ""
  );

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

  function onClaimChange(
    groupMetadataClaimRequestEligibility: GroupMetadataClaimRequestEligibility,
    selectedValue: number
  ) {
    const newSelectedSismoConnectRequest = {
      ...selectedSismoConnectRequest,
      selectedClaims: selectedSismoConnectRequest.selectedClaims.map(
        (claim) => {
          if (claim.uuid === groupMetadataClaimRequestEligibility.claim.uuid) {
            return {
              ...claim,
              selectedValue,
            };
          } else {
            return claim;
          }
        }
      ),
    };

    onUserInput(newSelectedSismoConnectRequest);
  }

  function onMessageChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setMessage(event.target.value);

    const newSelectedSismoConnectRequest = {
      ...selectedSismoConnectRequest,
      selectedSignature: {
        ...selectedSismoConnectRequest.selectedSignature,
        selectedMessage: event.target.value,
      },
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
          (groupMetadataClaimRequestEligibility, index) => (
            <ClaimSelect
              key={index + "/Claim"}
              selectedSismoConnectRequest={selectedSismoConnectRequest}
              groupMetadataClaimRequestEligibility={
                groupMetadataClaimRequestEligibility
              }
              onClaimChange={onClaimChange}
            />
          )
        )}
      </ClaimList>

      <MessageWrapper>
        <MessageTitle>Message Signature Request</MessageTitle>
        <Message
          disabled={
            !selectedSismoConnectRequest?.selectedSignature?.isSelectableByUser
          }
          onChange={onMessageChange}
          value={message}
        />
      </MessageWrapper>
    </Container>
  );
}
