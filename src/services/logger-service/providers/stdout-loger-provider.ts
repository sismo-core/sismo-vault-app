import { LogErrorParams, LoggerProvider } from "../interfaces/logger-provider";

export class StdOutLoggerProvider implements LoggerProvider {
  logInfo(...msg: any): void {
    console.info(...msg);
  }
  logError({ error, errorId, sourceId, level }: LogErrorParams): void {
    console.error(
      `errorId: ${errorId} / sourceId: ${sourceId} / level: ${level ?? "error"}`,
      "\n",
      error
    );
  }
}
