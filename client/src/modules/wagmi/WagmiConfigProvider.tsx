import React from 'react'
import { WagmiConfig } from 'wagmi'
import { wagmiClient } from './wagmiClient'


interface Props {
  children: React.ReactNode | React.ReactNode[],
}

export const WagmiConfigProvider: React.FC<Props> = ({ children }) => {
  return <WagmiConfig client={wagmiClient}>{children}</WagmiConfig>
}