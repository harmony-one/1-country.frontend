import config from '../../config'
import { ethers } from 'ethers'

export const defaultProvider = new ethers.providers.JsonRpcProvider(
  config.defaultRPC
)
