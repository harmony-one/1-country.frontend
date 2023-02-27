import React from 'react'
import ReactDOM from 'react-dom'
import Routes from './Routes'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './app.scss'
import { WagmiConfigProvider } from './modules/wagmi/WagmiConfigProvider'
import { BrowserRouter } from 'react-router-dom'
import { ModalProvider } from './modules/modals/ModalProvider'
import { UITransactionProvider } from './modules/transactions/UITransactionProvider'
import { MetaTags } from './modules/metatags/MetaTags'

console.log('### git commit hash', process.env.GIT_COMMIT_HASH)
document.body.ontouchstart = function () {}

ReactDOM.render(
  <BrowserRouter>
    <WagmiConfigProvider>
      <MetaTags />
      <Routes />
      {/* <Web3ModalProvider /> */}
      <ModalProvider />
      <UITransactionProvider />
      <ToastContainer position="top-left" />
    </WagmiConfigProvider>
  </BrowserRouter>,
  document.getElementById('root')
)
