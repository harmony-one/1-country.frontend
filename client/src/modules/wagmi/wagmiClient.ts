// import { configureChains, createClient } from 'wagmi'
// import { modalConnectors, walletConnectProvider } from '@web3modal/ethereum'
// import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
// import { publicProvider } from 'wagmi/providers/public'
// import config from '../../../config'

// const chains = [config.chainParameters]
// const { provider } = configureChains(chains, [
//   publicProvider(),
//   walletConnectProvider({ projectId: config.walletConnect.projectId }),
// ])

// // walletConnect with modern UI
// const web3ModalConnectors = modalConnectors({
//   appName: 'web3Modal',
//   chains,
// }).filter((connector) => connector.id === 'walletConnect')

// export const metamaskConnector = new MetaMaskConnector({ chains })
// export const [walletConnectConnector] = web3ModalConnectors
// export const wagmiClient = createClient({
//   autoConnect: false,
//   connectors: [metamaskConnector, walletConnectConnector],
//   provider,
// })

import { createConfig, configureChains } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { publicProvider } from 'wagmi/providers/public'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import config from '../../../config'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [config.chainParameters],
  [publicProvider()]
)

console.log(
  '### config.walletConnect.projectId',
  config.walletConnect.projectId
)
export const metamaskConnector = new MetaMaskConnector({ chains })
export const walletConnectConnector = new WalletConnectConnector({
  chains: chains,
  options: {
    projectId: config.walletConnect.projectId,
  },
})

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [metamaskConnector, walletConnectConnector],
  publicClient,
  webSocketPublicClient,
})
