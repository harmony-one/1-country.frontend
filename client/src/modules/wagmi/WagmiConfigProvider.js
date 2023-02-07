import React from 'react'
import { WagmiConfig } from 'wagmi'
import { wagmiClient } from './wagmiClient'

export const WagmiConfigProvider = ({ children }) => {
  return <WagmiConfig client={wagmiClient}>{children}</WagmiConfig>
}
