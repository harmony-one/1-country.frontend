import {useEffect, useState} from "react";
import Web3 from "web3";
import { useSelector } from 'react-redux'
import {useAccount} from "wagmi";

import config from "../../config";
import apis, {D1DCClient} from "../api";

import { selectWallet, selectIsWalletConnected } from '../utils/store/walletSlice'
import { PROVIDER_TYPE } from '../utils/sms-wallet/SmsWallet.utils'


export const useClient = () => {
  const [client, setClient] = useState<D1DCClient>()

  const [provider, setProvider] = useState(PROVIDER_TYPE.NONE)
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [isClientConnected, setIsClientConnected] = useState(false)

  const smsWallet = useSelector(selectWallet)
  const isWalletConnected = useSelector(selectIsWalletConnected)
  const { address, connector, isConnected } = useAccount()

  useEffect(() => {
    if (!address && !smsWallet && provider === PROVIDER_TYPE.NONE) {
      const web3 = new Web3(config.defaultRPC)
      const api = apis({ web3, address })
      setClient(api)
    }
  }, [])

  useEffect(() => {
    if (!isConnected) {
      const web3 = new Web3(config.defaultRPC)
      const api = apis({ web3, address: smsWallet })
      setClient(api)
      setWalletAddress(smsWallet)
      setIsClientConnected(isWalletConnected)
      setProvider(PROVIDER_TYPE.SMS_WALLET)
    }
  }, [smsWallet])

  useEffect(() => {
    const callApi = async () => {
      const provider = await connector.getProvider()
      const web3 = new Web3(provider)
      const api = apis({ web3, address })
      setWalletAddress(address)
      setIsClientConnected(isConnected)
      setProvider(PROVIDER_TYPE.WALLET_CONNECT)
      setClient(api)
    }
    if (connector && address && !isWalletConnected) {
      callApi()
    }
  }, [connector, address])

  return { client, walletAddress, isClientConnected }
}