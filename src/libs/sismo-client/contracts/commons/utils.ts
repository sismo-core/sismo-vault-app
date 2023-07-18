import { SupportedChainId, SupportedChainName } from ".";

export const isSupportedChainId = (chain: SupportedChainId | SupportedChainName) => {
  const res = parseInt(chain.toString(), 10);
  return !isNaN(res);
};
