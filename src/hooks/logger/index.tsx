import React, { useCallback, useContext, useMemo } from "react";
import { LoggerService } from "../../services/logger-service/logger-service";
import { ErrorContexts, ErrorType } from "../../services/logger-service/interfaces/logger-provider";
import { VaultClient } from "../../services/vault-client";
import { getVaultErrorContext } from "./utils/getVaultErrorContext";

interface LoggerContextType {
  error: (params: {
    error: ErrorType;
    sourceId: string;
    contexts?: ErrorContexts;
    level?: "error" | "fatal";
  }) => Promise<string>;
  info: (...msg: any) => void;
}

export function useLogger(): LoggerContextType {
  const context = useContext(LoggerContext);
  if (context === null) {
    throw new Error("useLogger must be used within a LoggerProvider");
  }
  return context;
}

export const LoggerContext = React.createContext<LoggerContextType | null>(null);

export function LoggerProvider({
  children,
  logger,
  vaultClient,
}: {
  children: React.ReactNode;
  logger: LoggerService;
  vaultClient: VaultClient;
}): JSX.Element {
  const error = useCallback(
    async ({
      error,
      sourceId,
      contexts,
      level,
    }: {
      error: ErrorType;
      sourceId: string;
      contexts?: ErrorContexts;
      level?: "error" | "fatal";
    }) => {
      const vault = await getVaultErrorContext({ vaultClient });
      const errorId = logger.error({
        error,
        sourceId,
        level,
        contexts: {
          ...contexts,
          vault,
        },
      });
      return errorId;
    },
    [logger, vaultClient]
  );

  const value: LoggerContextType = useMemo(() => {
    return {
      error,
      info: logger.info,
    };
  }, [error, logger]);

  return <LoggerContext.Provider value={value}>{children}</LoggerContext.Provider>;
}
