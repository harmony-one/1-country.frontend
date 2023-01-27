import { useEffect, useState } from 'react'
import Web3 from 'web3'
import { useSelector } from 'react-redux'
import { useAccount } from 'wagmi'

import config from '../../config'
import apis from '../api'
import { selectWallet, selectIsWalletConnected } from '../utils/store/walletSlice'

export const useClient = () => {
  // @ts-expect-error
  const [client, setClient] = useState(apis({}))
  const [walletAddress, setWalletAddress] = useState()
  const [isClientConnected, setIsClientConnected] = useState(false)

  const smsWallet = useSelector(selectWallet)
  const isWalletConnected = useSelector(selectIsWalletConnected)
  const { address, connector, isConnected } = useAccount()
  console.log('useClient', isWalletConnected, isClientConnected)
  useEffect(() => {
    if (!address && !smsWallet) {
      const web3 = new Web3(config.defaultRPC)
      const api = apis({ web3, address })
      setClient(api)
    }
  }, [])

  useEffect(() => {
    const web3 = new Web3(config.defaultRPC)
    const api = apis({ web3, address: smsWallet })
    setClient(api)
    setWalletAddress(smsWallet)
    setIsClientConnected(isWalletConnected)
  },
  [smsWallet])

  useEffect(() => {
    const callApi = async () => {
      const provider = await connector.getProvider()
      const web3 = new Web3(provider)
      const api = apis({ web3, address })
      setClient(api)
    }
    if (connector && address) {
      callApi()
    }
    if (!isWalletConnected) {
      setWalletAddress(address)
      setIsClientConnected(isConnected)
    }
  }, [connector, address])

  return [client, walletAddress, isClientConnected]
}
