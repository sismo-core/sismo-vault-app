import styled from "styled-components";
import { Fragment, useState } from "react";
import {
  AuthRequestEligibility,
  GroupMetadataClaimRequestEligibility,
  SelectedSismoConnectRequest,
} from "../../../../libs/sismo-client/sismo-connect-prover/sismo-connect-v1";
import { CaretUp } from "phosphor-react";
import colors from "../../../../theme/colors";
import { DataRequest } from "./DataRequest";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Title = styled.div`
  font-size: 14px;
  line-height: 20px;
  font-family: ${(props) => props.theme.fonts.bold};
  color: ${(props) => props.theme.colors.blue0};
`;

const ListWrapper = styled.div`
  border: 1px solid ${(props) => props.theme.colors.blue7};
  border-radius: 6px;
  margin-bottom: 24px;

  //  height: 500px;
`;

const RequiredWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0px 16px;
`;

const OptionalSeparator = styled.div`
  height: 1px;
  width: 100%;
  background: ${(props) => props.theme.colors.blue7};
`;

const ItemSeparator = styled.div`
  height: 1px;
  background: ${(props) => props.theme.colors.blue9};
`;

const OptionalWrapper = styled.div`
  padding: 0px 16px;
`;

const OptionalList = styled.div<{ isFolded: boolean }>`
  display: flex;
  flex-direction: column;

  visibility: ${(props) => (props.isFolded ? "hidden" : "visible")};
  height: ${(props) => (props.isFolded ? "0px" : "auto")};
`;

const OptionalTitle = styled.div<{ folded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  line-height: 20px;
  font-family: ${(props) => props.theme.fonts.medium};
  color: ${(props) => props.theme.colors.blue3};
  padding-top: 16px;
  padding-bottom: ${(props) => (!props.folded ? "16px" : "0px")};
  cursor: pointer;
`;

const CaretWrapper = styled.div<{ folded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  transform: ${(props) => (props.folded ? "rotateX(0deg)" : "rotateX(180deg)")};
  cursor: pointer;
`;

type Props = {
  selectedSismoConnectRequest: SelectedSismoConnectRequest;
  groupMetadataClaimRequestEligibilities: GroupMetadataClaimRequestEligibility[];
  authRequestEligibilities: AuthRequestEligibility[];
  appName: string;
  loadingEligible: boolean;
  proofLoading: boolean;
  onUserInput: (
    selectedSismoConnectRequest: SelectedSismoConnectRequest
  ) => void;
};

export default function DataRequests({
  selectedSismoConnectRequest,
  groupMetadataClaimRequestEligibilities,
  authRequestEligibilities,
  appName,
  loadingEligible,
  proofLoading,
  onUserInput,
}: Props) {
  const [optionalFolded, setOptionalFolded] = useState<boolean>(true);

  const requiredAuths = [];
  const optionalAuths = [];

  const requiredClaims = [];
  const optionalClaims = [];

  if (authRequestEligibilities) {
    for (const authRequestEligibility of authRequestEligibilities) {
      if (authRequestEligibility?.auth?.isOptional) {
        optionalAuths.push(authRequestEligibility);
      } else {
        requiredAuths.push(authRequestEligibility);
      }
    }
  }

  if (groupMetadataClaimRequestEligibilities) {
    for (const groupMetadataClaimRequestEligibility of groupMetadataClaimRequestEligibilities) {
      if (groupMetadataClaimRequestEligibility?.claim?.isOptional) {
        optionalClaims.push(groupMetadataClaimRequestEligibility);
      } else {
        requiredClaims.push(groupMetadataClaimRequestEligibility);
      }
    }
  }

  function getInitialOptinFromAuth(
    authRequestEligibility: AuthRequestEligibility
  ) {
    if (!authRequestEligibility?.isEligible) return false;
    const selectedAuth = selectedSismoConnectRequest?.selectedAuths?.find(
      (auth) => auth.uuid === authRequestEligibility.auth.uuid
    );

    return selectedAuth?.isOptIn !== null
      ? selectedAuth?.isOptIn
      : authRequestEligibility.isEligible;
  }

  function getInitialOptinFromClaim(
    groupMetadataClaimRequestEligibility: GroupMetadataClaimRequestEligibility
  ) {
    if (!groupMetadataClaimRequestEligibility?.isEligible) return false;
    const selectedClaim = selectedSismoConnectRequest?.selectedClaims?.find(
      (claim) => claim.uuid === groupMetadataClaimRequestEligibility.claim.uuid
    );
    return selectedClaim?.isOptIn !== null
      ? selectedClaim?.isOptIn
      : groupMetadataClaimRequestEligibility.isEligible;
  }

  return (
    <Container>
      <Title>{appName} wants you to:</Title>
      <ListWrapper>
        <RequiredWrapper>
          {requiredAuths?.length > 0 &&
            requiredAuths?.map((authRequestEligibility, index) => (
              <Fragment key={authRequestEligibility.auth.uuid}>
                {index !== 0 && <ItemSeparator />}
                <DataRequest
                  authRequestEligibility={authRequestEligibility}
                  selectedSismoConnectRequest={selectedSismoConnectRequest}
                  isInitialOptin={getInitialOptinFromAuth(
                    authRequestEligibility
                  )}
                  onUserInput={onUserInput}
                  loadingEligible={loadingEligible}
                  proofLoading={proofLoading}
                />
              </Fragment>
            ))}
          {requiredClaims?.length > 0 &&
            requiredClaims?.map(
              (groupMetadataClaimRequestEligibility, index) => (
                <Fragment key={groupMetadataClaimRequestEligibility.claim.uuid}>
                  {(index !== 0 || requiredAuths?.length > 0) && (
                    <ItemSeparator />
                  )}
                  <DataRequest
                    groupMetadataClaimRequestEligibility={
                      groupMetadataClaimRequestEligibility
                    }
                    isInitialOptin={getInitialOptinFromClaim(
                      groupMetadataClaimRequestEligibility
                    )}
                    selectedSismoConnectRequest={selectedSismoConnectRequest}
                    onUserInput={onUserInput}
                    loadingEligible={loadingEligible}
                    proofLoading={proofLoading}
                  />
                </Fragment>
              )
            )}
        </RequiredWrapper>

        {(optionalAuths?.length > 0 || optionalClaims?.length > 0) && (
          <>
            {" "}
            <OptionalSeparator />
            <OptionalWrapper>
              <OptionalTitle
                folded={optionalFolded}
                onClick={() => setOptionalFolded(!optionalFolded)}
              >
                <div>Optional</div>
                <CaretWrapper folded={optionalFolded}>
                  <CaretUp size={16} color={colors.blue3} />
                </CaretWrapper>
              </OptionalTitle>

              <OptionalList isFolded={!optionalFolded}>
                {optionalAuths?.length > 0 &&
                  optionalAuths?.map((authRequestEligibility, index) => (
                    <Fragment key={authRequestEligibility.auth.uuid}>
                      {index !== 0 && <ItemSeparator />}
                      <DataRequest
                        authRequestEligibility={authRequestEligibility}
                        isInitialOptin={getInitialOptinFromAuth(
                          authRequestEligibility
                        )}
                        selectedSismoConnectRequest={
                          selectedSismoConnectRequest
                        }
                        onUserInput={onUserInput}
                        loadingEligible={loadingEligible}
                        proofLoading={proofLoading}
                      />
                    </Fragment>
                  ))}
                {optionalClaims?.length > 0 &&
                  optionalClaims?.map(
                    (groupMetadataClaimRequestEligibility, index) => (
                      <Fragment
                        key={groupMetadataClaimRequestEligibility.claim.uuid}
                      >
                        {(index !== 0 || optionalAuths?.length > 0) && (
                          <ItemSeparator />
                        )}
                        <DataRequest
                          groupMetadataClaimRequestEligibility={
                            groupMetadataClaimRequestEligibility
                          }
                          isInitialOptin={getInitialOptinFromClaim(
                            groupMetadataClaimRequestEligibility
                          )}
                          selectedSismoConnectRequest={
                            selectedSismoConnectRequest
                          }
                          onUserInput={onUserInput}
                          loadingEligible={loadingEligible}
                          proofLoading={proofLoading}
                        />
                      </Fragment>
                    )
                  )}
              </OptionalList>
            </OptionalWrapper>{" "}
          </>
        )}
      </ListWrapper>
    </Container>
  );
}
