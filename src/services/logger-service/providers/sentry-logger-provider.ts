import * as Sentry from "@sentry/react";
import { LogErrorParams, LoggerProvider } from "../interfaces/logger-provider";
import { AxiosError } from "axios";

export class SentryLoggerProvider implements LoggerProvider {
  logInfo(): void {}
  logError({ error, sourceId, errorId, contexts, level }: LogErrorParams): void {
    level = level ?? "error";
    if ((error as AxiosError).isAxiosError) {
      const sentryError = error as AxiosError;
      const { method, url } = sentryError.config;
      const { statusText, data } = sentryError.response;
      const { status } = sentryError.response;
      sentryError.name = `${method.toUpperCase()} ${url} ${status} (${statusText})`;
      sentryError.message = JSON.stringify(data);
      Sentry.captureException(sentryError, {
        level,
        contexts: {
          ...contexts,
          axios: {
            code: sentryError.code,
            data: sentryError.response?.data,
            status: status,
            url: url,
          },
        },
        tags: {
          sourceId,
          errorId,
        },
      });
      return;
    }
    Sentry.captureException(error, {
      level,
      contexts,
      tags: {
        sourceId,
        errorId,
      },
    });
  }
}
