import { EthereumClient, Chain } from '@web3modal/ethereum'
import config from '../../../config'
import { wagmiClient } from '../wagmi/wagmiClient'

const chains: Chain[] = [config.chainParameters]
export const ethereumClient = new EthereumClient(wagmiClient, chains)
