import { EthereumClient } from '@web3modal/ethereum'
import config from '../../../config'
import { wagmiConfig } from '../wagmi/wagmiClient'

const chains = [config.chainParameters]

export const ethereumClient = new EthereumClient(wagmiConfig, chains)
