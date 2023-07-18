import { AuthType } from "../../../services/sismo-connect-provers/sismo-connect-prover-v1";

export function getHumanReadableAuthType(authType: AuthType) {
  const humanReadableType =
    authType === AuthType.EVM_ACCOUNT
      ? "Ethereum"
      : authType === AuthType.GITHUB
      ? "Github"
      : authType === AuthType.TWITTER
      ? "Twitter"
      : authType === AuthType.VAULT
      ? "User Id"
      : authType === AuthType.TELEGRAM
      ? "Telegram"
      : null;

  return humanReadableType;
}
