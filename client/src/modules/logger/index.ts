import zerg from 'zerg'
import { consoleBrowserColorful } from 'zerg/dist/transports'
import { sentryTransport } from './sentryTransport'
import config from '../../../config'
import { TLogLevel } from 'zerg/dist/types'

const logger = zerg.createLogger()

const levels: TLogLevel[] = config.console.hideErrors
  ? ['verbose', 'debug', 'info', 'warn']
  : undefined

// Add console logger
const listener = zerg.createListener({
  handler: consoleBrowserColorful,
  levels,
})

const sentryListener = zerg.createListener({
  handler: sentryTransport,
  levels: ['error'],
})

logger.addListener(sentryListener)
logger.addListener(listener)

export default logger
