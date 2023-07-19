import { AxiosError } from "axios";

export type ErrorContext = Record<string, unknown>;
export type ErrorContexts = Record<string, ErrorContext>;
export type LogErrorParams = {
  error: ErrorType;
  errorId: string;
  sourceId: string;
  contexts?: ErrorContexts;
  level?: "error" | "fatal";
};

export type ErrorType = Error | AxiosError;

export interface LoggerProvider {
  logInfo(message: string, ...optionalParams: any[]): void;
  logError({ error, errorId, sourceId, contexts, level }: LogErrorParams): void;
}
