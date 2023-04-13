import config from '../../config'
import TweetAbi from '../../abi/Tweet'
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider'
import { CallbackProps, SendProps } from './index'
import { utils } from './utils'
import { defaultProvider } from './defaultProvider'

import { Contract, ethers } from 'ethers'

const { tweetContractAddress } = config

console.log('TWEET CONTRACT ADDRESS', tweetContractAddress)

export interface SendResult {
  txReceipt: TransactionReceipt
  error: Error
}

interface ActivateProps extends CallbackProps {
  name: string
  amount: string
}

interface UpdateUrlProps extends CallbackProps {
  name: string
  url: string
}

interface AddUrlProps extends CallbackProps {
  name: string
  url: string
}

interface RemoveUrlProps extends CallbackProps {
  name: string
  pos: number
}

const tweetApi = ({
  provider,
  address,
}: {
  provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider
  address: string
}) => {
  // console.log('apis', web3, address)
  if (!provider) {
    return
  }

  const contractReadOnly = new Contract(
    tweetContractAddress,
    TweetAbi,
    defaultProvider
  )

  const contract = contractReadOnly.connect(provider.getSigner())

  const send = async ({
    amount,
    onFailed,
    onTransactionHash = () => {},
    onSuccess,
    methodName,
    parameters,
  }: SendProps): Promise<SendResult> => {
    console.log('send', { methodName, parameters, amount, address })

    try {
      const txResponse = (await contract[methodName](...parameters, {
        value: amount,
      })) as TransactionResponse

      onTransactionHash(txResponse.hash)

      if (config.debug) {
        console.log(methodName, JSON.stringify(txResponse))
      }

      const txReceipt = await txResponse.wait()
      onSuccess && onSuccess(txReceipt)
      return { txReceipt: txReceipt, error: null }
    } catch (ex) {
      console.log('### ex', ex)
      onFailed && onFailed(ex, true)
      return { txReceipt: null, error: ex }
    }
  }

  return {
    address,
    contract,
    provider,
    send,
    activate: async ({
      name,
      amount,
      onFailed,
      onSuccess,
      onTransactionHash,
    }: ActivateProps) => {
      return send({
        amount,
        parameters: [name],
        methodName: 'activate',
        onFailed,
        onSuccess,
        onTransactionHash,
      })
    },
    updateURL: async ({
      name,
      url,
      onFailed,
      onSuccess,
      onTransactionHash,
    }: UpdateUrlProps) => {
      return send({
        parameters: [name, url],
        methodName: 'updateURL',
        onFailed,
        onSuccess,
        onTransactionHash,
      })
    },
    numUrls({ name }: { name: string }) {
      return contractReadOnly.numUrls(name)
    },
    removeRecordUrl: ({
      name,
      pos,
      onFailed,
      onSuccess,
      onTransactionHash,
    }: RemoveUrlProps) => {
      return send({
        parameters: [name, pos],
        methodName: 'removeUrl',
        onFailed,
        onSuccess,
        onTransactionHash,
      })
    },
    clearUrls({ name }: { name: string }) {
      return contractReadOnly.clearUrls(name)
    },
    addRecordUrl: ({
      name,
      url,
      onFailed,
      onSuccess,
      onTransactionHash,
    }: AddUrlProps) => {
      return send({
        parameters: [name, url],
        methodName: 'addURL',
        onFailed,
        onSuccess,
        onTransactionHash,
      })
    },
    getRecordUrlList: async ({ name }: { name: string }) => {
      return contractReadOnly.getAllUrls(name)
    },
    baseRentalPrice: () => {
      return contractReadOnly.baseRentalPrice()
    },
    initialized: () => {
      return contractReadOnly.initialized()
    },
    isActivated: (name: string) => {
      const hash = utils.keccak256(name, true)
      return contractReadOnly.activated(hash)
    },
  }
}

if (window) {
  // @ts-expect-error
  window.tweetApi = tweetApi
}

export default tweetApi

export type TweetClient = ReturnType<typeof tweetApi>
