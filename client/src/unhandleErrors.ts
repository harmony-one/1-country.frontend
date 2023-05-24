import config from '../config'
import logger from './modules/logger'
const log = logger.module('Catch error')

if (config.console.hideErrors) {
  console.error = () => {}
  window.addEventListener('error', function (event) {
    event.preventDefault()

    log.error('Uncaught error:', { message: event.message, error: event.error })
    return false
  })
}
