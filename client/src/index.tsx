import React from 'react'
import ReactDOM from 'react-dom'
import Routes from './Routes'
import { ToastContainer } from 'react-toastify'
import { Helmet } from 'react-helmet'
import 'react-toastify/dist/ReactToastify.css'
import './app.scss'
import { WagmiConfigProvider } from './modules/wagmi/WagmiConfigProvider'
import { BrowserRouter } from 'react-router-dom'
import { ModalProvider } from './modules/modals/ModalProvider'
import { UITransactionProvider } from './modules/transactions/UITransactionProvider'

console.log('### git commit hash', process.env.GIT_COMMIT_HASH)
document.body.ontouchstart = function () {}

ReactDOM.render(
  <BrowserRouter>
    <WagmiConfigProvider>
      <Helmet>
        <meta charSet="utf-8" />
        <title>.country | Harmony</title>
        <meta
          name="description"
          // content="Harmony’s .country unifies Internet domains and crypto names as Web3 identities. Short, onchain names like s.1 store your wallet addresses, digitial collectibles, social reputation – on Harmony across multiple blockchains. Proper, browsable domains like s.country displays your career metrics, vanity links, embedded content – for fans to tips with emojis or pay for work. Yet, s.1 is magically the same as s.country – your creator economy with ONE!"
          content="Harmony's .country domains allow a seamless transition between Web2 and Web3. You can use your .country domain for both traditional websites and decentralized applications, making it easier to access everything you need from one place!"
        />
        {/* <link rel='icon' type='image/png' href={favicon} sizes='16x16' /> */}
      </Helmet>
      <Routes />
      {/* <Web3ModalProvider /> */}
      <ModalProvider />
      <UITransactionProvider />
      <ToastContainer position="top-left" />
    </WagmiConfigProvider>
  </BrowserRouter>,
  document.getElementById('root')
)
