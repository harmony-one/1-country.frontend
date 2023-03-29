import zerg from 'zerg';
import { consoleBrowserColorful } from 'zerg/dist/transports';
import { sentryTransport } from './sentryTransport';

const logger = zerg.createLogger();

// Add console logger
const listener = zerg.createListener({
  handler: consoleBrowserColorful,
});

const sentryListener = zerg.createListener({
  handler: sentryTransport,
  levels: ['error'],
});

logger.addListener(sentryListener);
logger.addListener(listener);

export default logger;
