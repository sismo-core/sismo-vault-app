import React, { useCallback, useContext, useEffect, useState } from "react";

export type MainScroll = {
  disabledScroll: (ticket: string) => void;
  enabledScroll: (ticket: string) => void;
};

export const useMainScrollManager = (): MainScroll => {
  return useContext(MainScrollContext);
};

export const MainScrollContext = React.createContext(null);

export default function MainScrollManagerProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [disabledTickets, setDisabledTickets] = useState([]);

  const disabledScroll = useCallback((ticket: string) => {
    setDisabledTickets((current) => {
      const next = [...current];
      const isTicketRegisterIndex =
        next && next.findIndex((disabledTicket) => disabledTicket === ticket);
      if (isTicketRegisterIndex !== -1) {
        return next;
      }
      next.push(ticket);
      return next;
    });
  }, []);

  const enabledScroll = useCallback((ticket: string) => {
    setDisabledTickets((current) => {
      let next = [...current];
      const isTicketRegisterIndex =
        next && next.findIndex((disabledTicket) => disabledTicket === ticket);
      if (isTicketRegisterIndex === -1) {
        return next;
      }
      next.splice(isTicketRegisterIndex, 1);
      return next;
    });
  }, []);

  useEffect(() => {
    const html: any = document.getElementsByTagName("HTML")[0];
    html.style.overflowX = "hidden";
    if (disabledTickets.length === 0) {
      html.style.overflowY = "initial";
    } else {
      html.style.overflowY = "hidden";
    }
  }, [disabledTickets]);

  return (
    <MainScrollContext.Provider
      value={{
        disabledScroll,
        enabledScroll,
      }}
    >
      {children}
    </MainScrollContext.Provider>
  );
}
