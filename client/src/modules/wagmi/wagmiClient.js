import { configureChains, createClient } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { publicProvider } from 'wagmi/providers/public'
// import { InjectedConnector } from 'wagmi/connectors/injected'
// import { modalConnectors, walletConnectProvider } from '@web3modal/ethereum'
import config from '../../../config'

const chains = [config.chainParameters]

const { provider } = configureChains(chains, [publicProvider()]) //, [walletConnectProvider({ projectId: config.walletConnect.projectId })])
console.log('PROVIDR ODSFSFF', chains, provider)
export const wagmiClient = createClient({
  // autoConnect: true,
  connectors: new MetaMaskConnector({ chains }),
  // modalConnectors({ appName: 'web3Modal', chains }),
  provider
})
