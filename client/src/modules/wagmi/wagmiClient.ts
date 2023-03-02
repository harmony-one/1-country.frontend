import { configureChains, createClient } from 'wagmi'
import { modalConnectors, walletConnectProvider } from '@web3modal/ethereum'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { publicProvider } from 'wagmi/providers/public'
import config from '../../../config'

const chains = [config.chainParameters]
const { provider } = configureChains(chains, [
  publicProvider(),
  walletConnectProvider({ projectId: config.walletConnect.projectId }),
])

// walletConnect with modern UI
const web3ModalConnectors = modalConnectors({
  appName: 'web3Modal',
  chains,
}).filter((connector) => connector.id === 'walletConnect')

export const metamaskConnector = new MetaMaskConnector({ chains })
export const [walletConnectConnector] = web3ModalConnectors
export const wagmiClient = createClient({
  autoConnect: true,
  connectors: [metamaskConnector, walletConnectConnector],
  provider,
})
