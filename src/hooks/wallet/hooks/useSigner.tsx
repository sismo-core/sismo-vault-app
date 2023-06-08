import { ethers, Signer } from "ethers";
import { useEffect, useState } from "react";
import { JsonRpcSigner } from "@ethersproject/providers";
import { OnboardHook } from "./useOnboard";

export type SignerHook = {
  sign: (message: string) => Promise<string>;
  signing: boolean;
  signer: Signer;
};

export const useSigner = (onboard: OnboardHook): SignerHook => {
  const [signer, setSigner] = useState<JsonRpcSigner>(null);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    if (!onboard?.connected?.provider) {
      setSigner(null);
    } else {
      const _provider = new ethers.providers.Web3Provider(
        onboard.connected.provider
      );
      setSigner(_provider.getSigner() as JsonRpcSigner);
    }
  }, [onboard?.connected]);

  const sign = async (message: string): Promise<string> => {
    if (!signer) throw new Error("Signer not available");
    setSigning(true);
    try {
      return await signer.signMessage(message);
    } catch (e) {
      return null;
    } finally {
      setSigning(false);
    }
  };

  return {
    sign,
    signing,
    signer,
  };
};
