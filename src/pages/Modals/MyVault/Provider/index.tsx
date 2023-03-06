import React, { useContext, useState } from "react";

type MyVault = {
  tab: string;
  isOpen: boolean;
  open: (tab: string) => void;
  close: () => void;
  switchTab: (tab: string) => void;
};

export const useMyVault = (): MyVault => {
  return useContext(MyVaultContext);
};

export const MyVaultContext = React.createContext(null);

export default function MyVaultModalProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [myVaultIsOpen, setMyVaultIsOpen] = useState<boolean>(false);
  const [myVaultTab, setMyVaultTab] = useState<string>(null);

  const switchTab = (tab: string) => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("myVault")) {
      url.searchParams.set("myVault", tab);
      window.history.replaceState(null, "New my vault url", url);
    }
    setMyVaultTab(tab);
  };

  const openMyVault = (tab: string) => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("myVault")) {
      url.searchParams.append("myVault", tab);
      window.history.replaceState(null, "New my vault url", url);
    }
    setMyVaultTab(tab);
    setMyVaultIsOpen(true);
  };

  const closeMyVault = () => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("myVault")) {
      url.searchParams.delete("myVault");
      window.history.replaceState(null, "New my vault url", url);
    }
    setMyVaultTab(null);
    setMyVaultIsOpen(false);
  };

  return (
    <MyVaultContext.Provider
      value={{
        tab: myVaultTab,
        isOpen: myVaultIsOpen,
        open: openMyVault,
        close: closeMyVault,
        switchTab,
      }}
    >
      {children}
    </MyVaultContext.Provider>
  );
}
