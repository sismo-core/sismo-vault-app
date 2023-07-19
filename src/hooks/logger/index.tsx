import React, { useCallback, useContext, useMemo } from "react";
import { LoggerService } from "../../services/logger-service/logger-service";
import { useVault } from "../vault";
import { ErrorContexts, ErrorType } from "../../services/logger-service/interfaces/logger-provider";

interface LoggerContextType {
  error: (params: {
    error: ErrorType;
    sourceId: string;
    contexts?: ErrorContexts;
    level?: "error" | "fatal";
  }) => string;
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
}: {
  children: React.ReactNode;
  logger: LoggerService;
}): JSX.Element {
  const { getErrorContext } = useVault();

  const error = useCallback(
    ({
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
      const errorId = logger.error({
        error,
        sourceId,
        level,
        contexts: {
          ...contexts,
          vault: getErrorContext(),
        },
      });
      return errorId;
    },
    [logger, getErrorContext]
  );

  const value: LoggerContextType = useMemo(() => {
    return {
      error,
      info: logger.info,
    };
  }, [error, logger]);

  return <LoggerContext.Provider value={value}>{children}</LoggerContext.Provider>;
}
