import React from 'react'
import ReactDOM from 'react-dom'
import Routes from './Routes'
import { Provider } from 'react-redux'
import { Grommet } from 'grommet'
import { PersistGate } from 'redux-persist/integration/react'
import { ToastContainer } from 'react-toastify'
import { Helmet } from 'react-helmet'
import { HelmetProvider } from 'react-helmet-async'
import 'react-toastify/dist/ReactToastify.css'
import './app.scss'
import { Web3ModalProvider } from './modules/web3modal/Web3ModalProvider'
import { WagmiConfigProvider } from './modules/wagmi/WagmiConfigProvider'
import { store, persistor } from './utils/store/store'
import { BrowserRouter } from 'react-router-dom'
import { ModalProvider } from './modules/modals/ModalProvider'
import { theme } from './theme'

document.body.ontouchstart = function () {}

ReactDOM.render(
  <Provider store={store}>
    <Grommet full theme={theme}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <WagmiConfigProvider>
            <HelmetProvider>
              <Helmet>
                <meta charSet='utf-8' />
                <title>.1.country | Harmony</title>
                <meta name='description' content='Harmony’s .1.country unifies Internet domains and crypto names as Web3 identities. Short, onchain names like s.1 store your wallet addresses, digitial collectibles, social reputation – on Harmony across multiple blockchains. Proper, browsable domains like s.country displays your career metrics, vanity links, embedded content – for fans to tips with emojis or pay for work. Yet, s.1 is magically the same as s.country – your creator economy with ONE!' />
              </Helmet>
              <Routes />
              <Web3ModalProvider />
              <ToastContainer position='top-left' />
              <ModalProvider />
            </HelmetProvider>
          </WagmiConfigProvider>
        </BrowserRouter>
      </PersistGate>
    </Grommet>
  </Provider>,
  document.getElementById('root')
)
