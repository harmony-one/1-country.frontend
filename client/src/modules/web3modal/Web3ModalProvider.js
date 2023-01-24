import React from 'react'
import { Web3Modal } from '@web3modal/react'
import { ethereumClient } from './ethereumClient'
import config from '../../../config'

export const Web3ModalProvider = () => {
  return <Web3Modal projectId={config.walletConnect.projectId} ethereumClient={ethereumClient} />
}