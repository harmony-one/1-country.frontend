import { configureChains, createClient } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { publicProvider } from 'wagmi/providers/public'
import config from '../../../config'

const chains = [config.chainParameters]

const { provider } = configureChains(chains, [publicProvider()]) //, [walletConnectProvider({ projectId: config.walletConnect.projectId })])

export const metamaskConnector = new MetaMaskConnector({ chains })
export const wagmiClient = createClient({
  connectors: [metamaskConnector],
  provider,
})
