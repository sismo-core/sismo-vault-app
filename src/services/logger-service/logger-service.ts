import { ErrorContexts, ErrorType, LoggerProvider } from "./interfaces/logger-provider";

export class LoggerService {
  private _loggerProviders: LoggerProvider[];

  constructor({ loggerProviders }: { loggerProviders: LoggerProvider[] }) {
    this._loggerProviders = loggerProviders;
  }

  info(...msg: any): void {
    for (const provider of this._loggerProviders) {
      provider.logInfo(msg);
    }
  }

  error({
    error,
    sourceId,
    contexts,
    level,
  }: {
    error: ErrorType;
    sourceId: string;
    contexts?: ErrorContexts;
    level?: "error" | "fatal";
  }): string {
    const timestamp = Date.now();
    let min = 100000;
    let max = 999999;
    let random_number = Math.floor(Math.random() * (max - min + 1)) + min;
    const errorId = `${timestamp}-${random_number}`;
    for (const provider of this._loggerProviders) {
      provider.logError({
        error,
        errorId,
        sourceId,
        contexts,
        level,
      });
    }
    return errorId;
  }
}
