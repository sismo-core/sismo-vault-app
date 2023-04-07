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

const AuthItem = styled.div<{ isEligible: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${(props) =>
    props.isEligible ? props.theme.colors.green1 : props.theme.colors.blue0};
`;

type Props = {
  selectedSismoConnectRequest: SelectedSismoConnectRequest;
  authRequestEligibility: AuthRequestEligibility;
  onAuthChange: (
    authRequestEligibility: AuthRequestEligibility,
    selectedUserId: string
  ) => void;
};

export function AuthSelect({
  selectedSismoConnectRequest,
  authRequestEligibility,
  onAuthChange,
}: // groupMetadataDataRequestEligibilities,
Props) {
  const [valueSelected, setValueSelected] = useState("");

  function onChange(
    authRequestEligibility: AuthRequestEligibility,
    value: string
  ) {
    setValueSelected(value);
    onAuthChange(authRequestEligibility, value);
  }

  useEffect(() => {
    const selectedUserId = selectedSismoConnectRequest.selectedAuths
      .find((auth) => auth.uuid === authRequestEligibility?.auth?.uuid)
      ?.selectedUserId?.toLowerCase();

    if (selectedUserId === "0") {
      setValueSelected(
        authRequestEligibility?.accounts[0]?.identifier?.toLowerCase()
      );
      onAuthChange(
        authRequestEligibility,
        authRequestEligibility?.accounts[0]?.identifier?.toLowerCase()
      );
      return;
    }

    setValueSelected(selectedUserId);
    onAuthChange(authRequestEligibility, selectedUserId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authRequestEligibility]);

  const authType = authRequestEligibility?.auth?.authType;

  const humanReadableType =
    authType === AuthType.EVM_ACCOUNT
      ? "Ethereum account"
      : authType === AuthType.GITHUB
      ? "Github account"
      : authType === AuthType.TWITTER
      ? "Twitter account"
      : authType === AuthType.VAULT
      ? "Vault user id"
      : null;

  const isOptional = authRequestEligibility?.auth?.isOptional;

  return (
    <AuthItem isEligible={authRequestEligibility?.isEligible}>
      <div style={{ fontSize: 14 }}>
        {isOptional && <span style={{ marginRight: 10 }}>(optional)</span>}
        <span>{humanReadableType}</span>
      </div>

      {authType !== AuthType.VAULT && (
        <select
          disabled={!authRequestEligibility?.auth?.isSelectableByUser}
          onChange={(e) => onChange(authRequestEligibility, e.target.value)}
          value={valueSelected}
          style={{ cursor: "pointer", marginLeft: 10 }}
        >
          {authRequestEligibility?.accounts?.map((account, index) => {
            return (
              <option
                key={index + "/accountOption"}
                value={account?.identifier?.toLowerCase()}
              >
                {account?.ens
                  ? account?.ens
                  : account?.profile?.id
                  ? account?.profile?.login
                  : account.identifier}
              </option>
            );
          })}
        </select>
      )}
    </AuthItem>
  );
}
