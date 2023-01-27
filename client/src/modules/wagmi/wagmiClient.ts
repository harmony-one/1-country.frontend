import { configureChains, createClient } from 'wagmi'
import { modalConnectors, walletConnectProvider } from '@web3modal/ethereum'
import config from '../../../config'

const chains = [config.chainParameters]

const { provider } = configureChains(chains, [walletConnectProvider({ projectId: config.walletConnect.projectId })])

export const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({ appName: 'web3Modal', chains }),
  provider
})