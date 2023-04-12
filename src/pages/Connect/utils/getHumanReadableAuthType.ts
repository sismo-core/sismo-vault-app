import { AuthType } from "../../../libs/sismo-client/sismo-connect-prover/sismo-connect-v1";

export function getHumanReadableAuthType(authType: AuthType) {
  const humanReadableType =
    authType === AuthType.EVM_ACCOUNT
      ? "Ethereum"
      : authType === AuthType.GITHUB
      ? "Github"
      : authType === AuthType.TWITTER
      ? "Twitter"
      : authType === AuthType.VAULT
      ? "Vault id"
      : null;

  return humanReadableType;
}
