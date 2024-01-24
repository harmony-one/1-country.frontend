import React from 'react'
import { WagmiConfig } from 'wagmi'
import { wagmiConfig } from './wagmiClient'

interface Props {
  children: React.ReactNode | React.ReactNode[]
}

export const WagmiConfigProvider: React.FC<Props> = ({ children }) => {
  return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>
}
