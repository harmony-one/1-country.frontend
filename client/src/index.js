import React from 'react'
import ReactDOM from 'react-dom'
import Routes from './Routes'
import { ToastContainer } from 'react-toastify'
import { EthereumClient, modalConnectors, walletConnectProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { Helmet } from 'react-helmet'

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
    <Helmet>
      <meta charSet='utf-8' />
      <title>s.country | Harmony</title>
      <meta name='description' content='Harmony’s .1.country unifies Internet domains and crypto names as Web3 identities. Short, onchain names like s.1 store your wallet addresses, digitial collectibles, social reputation – on Harmony across multiple blockchains. Proper, browsable domains like s.country displays your career metrics, vanity links, embedded content – for fans to tips with emojis or pay for work. Yet, s.1 is magically the same as s.country – your creator economy with ONE!' />
    </Helmet>
    <Routes />
    <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    <ToastContainer position='top-left' />
  </WagmiConfig>,
  document.getElementById('root')
)
