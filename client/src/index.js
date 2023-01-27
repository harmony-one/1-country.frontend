import React from 'react'
import ReactDOM from 'react-dom'
import Routes from './Routes'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { ToastContainer } from 'react-toastify'
import { Helmet } from 'react-helmet'
import 'react-toastify/dist/ReactToastify.css'
import './app.scss'
import { Web3ModalProvider } from './modules/web3modal/Web3ModalProvider'
import { WagmiConfigProvider } from './modules/wagmi/WagmiConfigProvider'
import { store, persistor } from './utils/store/store'

document.body.ontouchstart = function () {}

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <WagmiConfigProvider>
        <Helmet>
          <meta charSet='utf-8' />
          <title>.1.country | Harmony</title>
          <meta name='description' content='Harmony’s .1.country unifies Internet domains and crypto names as Web3 identities. Short, onchain names like s.1 store your wallet addresses, digitial collectibles, social reputation – on Harmony across multiple blockchains. Proper, browsable domains like s.country displays your career metrics, vanity links, embedded content – for fans to tips with emojis or pay for work. Yet, s.1 is magically the same as s.country – your creator economy with ONE!' />
          {/* <link rel='icon' type='image/png' href={favicon} sizes='16x16' /> */}
        </Helmet>
        <Routes />
        <Web3ModalProvider />
        <ToastContainer position='top-left' />
      </WagmiConfigProvider>
    </PersistGate>
  </Provider>,
  document.getElementById('root')
)
