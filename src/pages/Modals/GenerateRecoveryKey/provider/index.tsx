import React, { useContext, useState } from "react";

type RecoveryKeyHook = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
  setRecoveryKey: (recoveryKey: string) => void;
  recoveryKey: string;
};

export const useGenerateRecoveryKey = (): RecoveryKeyHook => {
  return useContext(ModalsContext);
};

export const ModalsContext = React.createContext(null);

export default function GenerateRecoveryKeyModalProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [isOpen, setIsOpen] = useState(null);

  return (
    <ModalsContext.Provider
      value={{
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        isOpen: isOpen,
      }}
    >
      {children}
    </ModalsContext.Provider>
  );
}
