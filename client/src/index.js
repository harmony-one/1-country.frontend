import React from 'react'
import ReactDOM from 'react-dom'
import Routes from './Routes'
import { ToastContainer } from 'react-toastify'
import { EthereumClient, modalConnectors, walletConnectProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import config from '../config'

import 'react-toastify/dist/ReactToastify.css'
import './app.scss'

document.body.ontouchstart = function () {}

const projectId = process.env.WALLETCONNECT_PROJECTID

const chains = [config.chainParameters]

const { provider } = configureChains(chains, [walletConnectProvider({ projectId })])

const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({ appName: 'web3Modal', chains }),
  provider
})

export const ethereumClient = new EthereumClient(wagmiClient, chains)

ReactDOM.render(
  <WagmiConfig client={wagmiClient}>
    <Routes />
    <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    <ToastContainer position='top-left' />
  </WagmiConfig>,
  document.getElementById('root')
)
