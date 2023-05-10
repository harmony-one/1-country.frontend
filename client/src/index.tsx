import React from 'react'
import ReactDOM from 'react-dom'
import Routes from './Routes'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './app.scss'
import { WagmiConfigProvider } from './modules/wagmi/WagmiConfigProvider'
import { BrowserRouter } from 'react-router-dom'
import { ModalProvider } from './modules/modals/ModalProvider'
import { Web3ModalProvider } from './modules/web3modal/Web3ModalProvider'
import { UITransactionProvider } from './modules/transactions/UITransactionProvider'
import { MetaTags } from './modules/metatags/MetaTags'
import { Grommet } from 'grommet/components/Grommet'
import config from '../config'
import { theme } from './constants'
import ErrorBoundary from './ErrorBoundary'
import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
import { Bootstrap } from './utils/Bootstrap'
import { GlobalStyles } from './components/global'

console.log('### config.sentryDSN', config.sentryDSN)
Sentry.init({
  dsn: config.sentryDSN,
  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
})

Sentry.setTag('version', process.env.GIT_COMMIT_HASH)

console.log('### git commit hash', process.env.GIT_COMMIT_HASH)
document.body.ontouchstart = function () {}

window.embedly('defaults', {
  cards: {
    key: config.embedly.key,
  },
})

ReactDOM.render(
  <ErrorBoundary>
    <BrowserRouter>
      <Grommet theme={theme} themeMode="light">
        <GlobalStyles />
        <WagmiConfigProvider>
          <MetaTags />
          <Bootstrap />
          <Routes />
          <Web3ModalProvider />
          <ModalProvider />
          <UITransactionProvider />
          <ToastContainer position="top-left" />
        </WagmiConfigProvider>
      </Grommet>
    </BrowserRouter>
  </ErrorBoundary>,
  document.getElementById('root')
)
