import React, { useContext } from "react";
import { OnboardHook, useOnboard } from "./hooks/useOnboard";
import { useSigner, SignerHook } from "./hooks/useSigner";

const ConnectorContext = React.createContext(null);

type Wallet = SignerHook & OnboardHook;

export const useWallet = (): Wallet => {
  return useContext(ConnectorContext);
};

export default function WalletProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const onboard = useOnboard();
  const signer = useSigner(onboard);

  return (
    <ConnectorContext.Provider
      value={{
        ...onboard,
        ...signer,
      }}
    >
      {children}
    </ConnectorContext.Provider>
  );
}
