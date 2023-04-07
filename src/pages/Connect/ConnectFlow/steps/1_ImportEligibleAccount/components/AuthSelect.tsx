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
  onAuthOptInChange: (
    authRequestEligibility: AuthRequestEligibility,
    isOptIn: boolean
  ) => void;
};

export function AuthSelect({
  selectedSismoConnectRequest,
  authRequestEligibility,
  onAuthChange,
  onAuthOptInChange,
}: Props) {
  const [valueSelected, setValueSelected] = useState("");
  const [isOptIn, setIsOptIn] = useState<boolean>();

  function onValueChange(
    authRequestEligibility: AuthRequestEligibility,
    value: string
  ) {
    setValueSelected(value);
    onAuthChange(authRequestEligibility, value);
  }

  function onOptInChange(
    authRequestEligibility: AuthRequestEligibility,
    value: boolean
  ) {
    if (!authRequestEligibility?.isEligible) return;

    setIsOptIn(value);
    onAuthOptInChange(authRequestEligibility, value);
  }

  useEffect(() => {
    const selectedAuth = selectedSismoConnectRequest.selectedAuths.find(
      (auth) => auth.uuid === authRequestEligibility?.auth?.uuid
    );
    const selectedUserId = selectedAuth?.selectedUserId?.toLowerCase();
    const selectedOptIn =
      selectedAuth?.isOptIn && authRequestEligibility?.isEligible;

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

    setIsOptIn(selectedOptIn);
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

  const isOptional =
    authRequestEligibility?.auth?.isOptional &&
    authRequestEligibility?.isEligible;
  const isEligible = authRequestEligibility?.auth?.isOptional
    ? isOptIn && authRequestEligibility?.isEligible
    : authRequestEligibility?.isEligible;

  return (
    <AuthItem isEligible={isEligible}>
      <div style={{ fontSize: 14 }}>
        {isOptional && (
          <input
            type="checkbox"
            name="optIn"
            value="optIn"
            checked={isOptIn}
            disabled={!authRequestEligibility?.isEligible}
            onChange={(e) =>
              onOptInChange(authRequestEligibility, e.target.checked)
            }
          />
        )}
        {isOptional && <span style={{ marginRight: 10 }}>(optional)</span>}
        <span>{humanReadableType}</span>
      </div>

      {authType !== AuthType.VAULT && isEligible && (
        <select
          disabled={!authRequestEligibility?.auth?.isSelectableByUser}
          onChange={(e) =>
            onValueChange(authRequestEligibility, e.target.value)
          }
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
