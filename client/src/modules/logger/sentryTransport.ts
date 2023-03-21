import * as Sentry from '@sentry/react';
import { TLogMessage } from 'zerg/dist/types';

const SENTRY_LEVEL_MAP = {
  info: 'info',
  warn: 'warning',
  error: 'error',
  fatal: 'error',
};

function hasException(logMessage: TLogMessage) {
  if (!logMessage.extendedData || !logMessage.extendedData.error) {
    return false;
  }

  return logMessage.extendedData.error instanceof Error;
}

export function sentryTransport(logMessage: TLogMessage) {
  //@ts-ignore
  const level = SENTRY_LEVEL_MAP[logMessage.level];

  Sentry.withScope(scope => {
    scope.setLevel(level);

    Object.keys(logMessage.extendedData).forEach(key => {
      scope.setExtra(key, logMessage.extendedData[key]);
    });

    scope.setTag('module', logMessage.moduleName);

    if (hasException(logMessage)) {
      const exMessage = logMessage.extendedData?.error?.message;
      Sentry.captureMessage(`${logMessage.message}: ${exMessage}`);
    } else {
      Sentry.captureMessage(logMessage.message);
    }
  });
}
