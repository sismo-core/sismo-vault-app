import styled from "styled-components";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  AuthRequestEligibility,
  ClaimRequestEligibility,
  RequestGroupMetadata,
  SelectedSismoConnectRequest,
  SismoConnectRequest,
} from "../../../../libs/sismo-connect-provers/sismo-connect-prover-v1";
import { CaretUp } from "phosphor-react";
import colors from "../../../../theme/colors";
import { DataSourceRequest } from "./components/DataSourceRequest";
import { useSismo } from "../../../../hooks/sismo";
import { useVault } from "../../../../hooks/vault";
import * as Sentry from "@sentry/react";
import { ImportedAccount } from "../../../../libs/vault-client";
import { getIsEligible } from "../../utils/getIsEligible";
import { DataClaimRequest } from "./components/DataClaimRequest";
import { getPoseidon } from "../../../../libs/poseidon";
import { BigNumber, ethers } from "ethers";
import { keccak256 } from "ethers/lib/utils";
import { SNARK_FIELD } from "@sismo-core/crypto";

const Container = styled.div`
  border: 1px solid ${(props) => props.theme.colors.blue7};
  border-radius: 6px;
  margin-bottom: 24px;
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
  onSelectedSismoRequest: (
    selectedSismoRequest: SelectedSismoConnectRequest
  ) => void;
  selectedSismoConnectRequest: SelectedSismoConnectRequest;
  sismoConnectRequest: SismoConnectRequest;
  requestGroupsMetadata: RequestGroupMetadata[];
  proofLoading: boolean;
  onEligible: (isEligible: boolean) => void;
};

export default function DataRequests({
  sismoConnectRequest,
  requestGroupsMetadata,
  proofLoading,
  onSelectedSismoRequest,
  onEligible,
  selectedSismoConnectRequest,
}: Props) {
  const [authRequestEligibilities, setAuthRequestEligibilities] =
    useState<AuthRequestEligibility[]>(null);
  const [claimRequestEligibilities, setClaimRequestEligibilities] =
    useState<ClaimRequestEligibility[]>(null);
  const [loadingEligible, setLoadingEligible] = useState(true);
  const { getClaimRequestEligibilities, getAuthRequestEligibilities } =
    useSismo();
  const vault = useVault();
  const isDefaultSet = useRef(false);

  /* ************************************************************* */
  /* ********************* SET DEFAULT VALUE ********************* */
  /* ************************************************************* */

  useEffect(() => {
    if (loadingEligible) return;
    if (!sismoConnectRequest) return;
    if (!authRequestEligibilities && !claimRequestEligibilities) return;
    if (isDefaultSet.current) return;

    let defaultSelectedSismoConnectRequest: SelectedSismoConnectRequest = {
      ...sismoConnectRequest,
    };

    if (sismoConnectRequest?.signature) {
      defaultSelectedSismoConnectRequest = {
        ...defaultSelectedSismoConnectRequest,
        selectedSignature: {
          selectedMessage: sismoConnectRequest.signature.message,
          isSelectableByUser: sismoConnectRequest.signature.isSelectableByUser,
          extraData: sismoConnectRequest.signature.extraData,
        },
      };
    }

    if (authRequestEligibilities?.length > 0) {
      defaultSelectedSismoConnectRequest = {
        ...defaultSelectedSismoConnectRequest,
        selectedAuths: authRequestEligibilities?.map(
          (authRequestEligibility) => {
            let userAccount: ImportedAccount;

            if (authRequestEligibility?.auth?.userId === "0") {
              userAccount = authRequestEligibility?.accounts[0];
            }

            if (authRequestEligibility?.auth?.userId !== "0") {
              const defaultAccount = authRequestEligibility?.accounts.find(
                (account) =>
                  account.identifier?.toLowerCase() ===
                  authRequestEligibility?.auth?.userId?.toLowerCase()
              );

              if (defaultAccount) {
                userAccount = defaultAccount;
              } else {
                userAccount = authRequestEligibility?.accounts[0];
              }
            }

            return {
              ...authRequestEligibility.auth,
              selectedUserId: userAccount?.identifier,
              isOptIn: authRequestEligibility.auth?.isOptional
                ? authRequestEligibility.isEligible
                : true,
            };
          }
        ),
      };
    }

    if (claimRequestEligibilities?.length > 0) {
      defaultSelectedSismoConnectRequest = {
        ...defaultSelectedSismoConnectRequest,
        selectedClaims: claimRequestEligibilities.map(
          (claimRequestEligibility) => {
            return {
              ...claimRequestEligibility.claim,
              isOptIn: claimRequestEligibility.claim.isOptional
                ? claimRequestEligibility.isEligible
                : true,
              selectedValue: claimRequestEligibility?.claim?.value,
            };
          }
        ),
      };
    }

    isDefaultSet.current = true;
    onSelectedSismoRequest(defaultSelectedSismoConnectRequest);
  }, [
    sismoConnectRequest,
    onSelectedSismoRequest,
    selectedSismoConnectRequest,
    authRequestEligibilities,
    claimRequestEligibilities,
    loadingEligible,
  ]);

  /* ************************************************************* */
  /* ********************* GET ELIGIBILITY *********************** */
  /* ************************************************************* */

  useEffect(() => {
    const claims = sismoConnectRequest.claims;
    const auths = sismoConnectRequest.auths;

    if (!claims && !auths) {
      setLoadingEligible(false);
      return;
    }

    if (!vault) return;
    if (claims && !requestGroupsMetadata) return;

    const getEligibilities = async () => {
      try {
        setLoadingEligible(true);
        if (auths?.length) {
          const authRequestEligibilities = await getAuthRequestEligibilities(
            sismoConnectRequest,
            vault?.importedAccounts || []
          );
          setAuthRequestEligibilities(authRequestEligibilities);
        }
        if (claims?.length) {
          // List of all accountTypes of all claims
          const accountTypes: string[] = [];
          for (let requestGroupMetadata of requestGroupsMetadata) {
            for (let accountType of requestGroupMetadata.groupMetadata
              .accountTypes) {
              if (!accountTypes.find((el) => el === accountType))
                accountTypes.push(accountType);
            }
          }

          // List of all appId used to generate vaultId in groups of claims
          const appIds: string[] = [];
          for (let accountType of accountTypes) {
            const match = accountType.match(
              /sismo-connect-app\(appid=(0x[a-fA-F0-9]+)\)/i
            );
            if (match) {
              const appId = match[1];
              if (!appIds.find((el) => el === appId)) appIds.push(appId);
            }
          }

          // List of all owned identifiers
          let identifiers: string[] = [];
          for (let importedAccount of vault?.importedAccounts) {
            identifiers.push(importedAccount.identifier);
          }
          if (appIds?.length) {
            const vaultSecret = await vault.getVaultSecret();
            const poseidon = await getPoseidon();
            for (let appId of appIds) {
              const namespace = BigNumber.from(
                keccak256(
                  ethers.utils.solidityPack(
                    ["uint128", "uint128"],
                    [appId, BigNumber.from(0)]
                  )
                )
              )
                .mod(SNARK_FIELD)
                .toHexString();
              const userId = poseidon([vaultSecret, namespace]).toHexString();
              identifiers.push(userId);
            }
          }

          const claimRequestEligibilities = await getClaimRequestEligibilities(
            sismoConnectRequest,
            identifiers
          );
          setClaimRequestEligibilities(claimRequestEligibilities);
        }
        setLoadingEligible(false);
      } catch (e) {
        console.error(e);
        Sentry.captureException(e);
        setLoadingEligible(false);
      }
    };
    getEligibilities();
  }, [
    vault,
    getClaimRequestEligibilities,
    getAuthRequestEligibilities,
    requestGroupsMetadata,
    sismoConnectRequest,
  ]);

  /* ************************************************************* */
  /* *************************** FORM **************************** */
  /* ************************************************************* */

  const [optionalFolded, setOptionalFolded] = useState<boolean>(true);

  const requiredAuths = [];
  const optionalAuths = [];

  const requiredClaims = [];
  const optionalClaims = [];

  if (sismoConnectRequest?.auths) {
    for (const auth of sismoConnectRequest?.auths) {
      if (auth?.isOptional) {
        optionalAuths.push(auth);
      } else {
        requiredAuths.push(auth);
      }
    }
  }

  if (sismoConnectRequest?.claims) {
    for (const claim of sismoConnectRequest?.claims) {
      if (claim?.isOptional) {
        optionalClaims.push(claim);
      } else {
        requiredClaims.push(claim);
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
    claimRequestEligibility: ClaimRequestEligibility
  ) {
    if (!claimRequestEligibility?.isEligible) return false;
    const selectedClaim = selectedSismoConnectRequest?.selectedClaims?.find(
      (claim) => claim.uuid === claimRequestEligibility.claim.uuid
    );
    return selectedClaim?.isOptIn !== null
      ? selectedClaim?.isOptIn
      : claimRequestEligibility.isEligible;
  }

  useEffect(() => {
    if (!claimRequestEligibilities && !authRequestEligibilities) return;
    let isSismoConnectRequestEligible: boolean = getIsEligible(
      claimRequestEligibilities,
      authRequestEligibilities
    );
    onEligible(isSismoConnectRequestEligible);
  }, [
    claimRequestEligibilities,
    authRequestEligibilities,
    sismoConnectRequest,
    onEligible,
  ]);

  return (
    <Container>
      <RequiredWrapper>
        {requiredAuths?.length > 0 &&
          requiredAuths?.map((auth, index) => (
            <Fragment key={auth.uuid}>
              {index !== 0 && <ItemSeparator />}
              <DataSourceRequest
                auth={auth}
                authRequestEligibility={authRequestEligibilities?.find(
                  (el) => el.auth.uuid === auth.uuid
                )}
                selectedSismoConnectRequest={selectedSismoConnectRequest}
                isInitialOptin={getInitialOptinFromAuth(
                  authRequestEligibilities?.find(
                    (el) => el.auth.uuid === auth.uuid
                  )
                )}
                onUserInput={onSelectedSismoRequest}
                loadingEligible={loadingEligible}
                proofLoading={proofLoading}
              />
            </Fragment>
          ))}
        {requiredClaims?.length > 0 &&
          requiredClaims?.map((claim, index) => (
            <Fragment key={claim.uuid}>
              {(index !== 0 || requiredAuths?.length > 0) && <ItemSeparator />}
              <DataClaimRequest
                claim={claim}
                groupMetadata={
                  requestGroupsMetadata?.find(
                    (metadata) => metadata.claim.uuid === claim.uuid
                  )?.groupMetadata
                }
                claimRequestEligibility={claimRequestEligibilities?.find(
                  (el) => el.claim.uuid === claim.uuid
                )}
                isInitialOptin={getInitialOptinFromClaim(
                  claimRequestEligibilities?.find(
                    (el) => el.claim.uuid === claim.uuid
                  )
                )}
                selectedSismoConnectRequest={selectedSismoConnectRequest}
                onUserInput={onSelectedSismoRequest}
                loadingEligible={loadingEligible}
                proofLoading={proofLoading}
              />
            </Fragment>
          ))}
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
                optionalAuths?.map((auth, index) => (
                  <Fragment key={auth.uuid}>
                    {index !== 0 && <ItemSeparator />}
                    <DataSourceRequest
                      auth={auth}
                      authRequestEligibility={authRequestEligibilities?.find(
                        (el) => el.auth.uuid === auth.uuid
                      )}
                      isInitialOptin={getInitialOptinFromAuth(
                        authRequestEligibilities?.find(
                          (el) => el.auth.uuid === auth.uuid
                        )
                      )}
                      selectedSismoConnectRequest={selectedSismoConnectRequest}
                      onUserInput={onSelectedSismoRequest}
                      loadingEligible={loadingEligible}
                      proofLoading={proofLoading}
                    />
                  </Fragment>
                ))}
              {optionalClaims?.length > 0 &&
                optionalClaims?.map((claim, index) => (
                  <Fragment key={claim.uuid}>
                    {(index !== 0 || optionalAuths?.length > 0) && (
                      <ItemSeparator />
                    )}
                    <DataClaimRequest
                      claim={claim}
                      groupMetadata={
                        requestGroupsMetadata?.find(
                          (metadata) => metadata.claim.uuid === claim.uuid
                        )?.groupMetadata
                      }
                      claimRequestEligibility={claimRequestEligibilities?.find(
                        (el) => el.claim.uuid === claim.uuid
                      )}
                      isInitialOptin={getInitialOptinFromClaim(
                        claimRequestEligibilities?.find(
                          (el) => el.claim.uuid === claim.uuid
                        )
                      )}
                      selectedSismoConnectRequest={selectedSismoConnectRequest}
                      onUserInput={onSelectedSismoRequest}
                      loadingEligible={loadingEligible}
                      proofLoading={proofLoading}
                    />
                  </Fragment>
                ))}
            </OptionalList>
          </OptionalWrapper>{" "}
        </>
      )}
    </Container>
  );
}
