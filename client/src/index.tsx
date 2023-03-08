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

console.log('### git commit hash', process.env.GIT_COMMIT_HASH)
document.body.ontouchstart = function () {}

// window.embedly('defaults', {
//   cards: {
//     key: config.embedly.key
//   }
// })

ReactDOM.render(
  <BrowserRouter>
    <Grommet theme={theme} themeMode="light">
      <WagmiConfigProvider>
        <MetaTags />
        <Routes />
        <Web3ModalProvider />
        <ModalProvider />
        <UITransactionProvider />
        <ToastContainer position="top-left" />
      </WagmiConfigProvider>
    </Grommet>
  </BrowserRouter>,
  document.getElementById('root')
)
