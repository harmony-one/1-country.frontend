import { ethers, Contract } from 'ethers'
import {
  TransactionResponse,
  TransactionReceipt,
} from '@ethersproject/abstract-provider'

import config from '../../../config'
import VanityURLAbi from '../../../abi/VanityUrl'
import { defaultProvider } from '../defaultProvider'
import { CallbackProps, SendProps, SendResult } from '../index'

interface AddNewUrlProps extends CallbackProps {
  name: string
  aliasName: string
  url: string
  price: string
}

const vanityApis = ({
  provider,
  address,
}: {
  provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider
  address: string
}) => {
  if (!provider) {
    return
  }

  const contractReadOnly = new Contract(
    config.contractVanityURL,
    VanityURLAbi,
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
      onFailed && onFailed(ex, true)
      return { txReceipt: null, error: ex }
    }
  }

  return {
    address,
    contract,
    provider,
    send,
    addNewURL: async ({
      name,
      aliasName,
      url,
      price,
      onFailed,
      onSuccess,
      onTransactionHash,
    }: AddNewUrlProps) => {
      return send({
        parameters: [name, aliasName, url, ethers.utils.parseEther(price)],
        methodName: 'addNewURL',
        onFailed,
        onSuccess,
        onTransactionHash,
      })
    },
    existURL: async ({
      name,
      aliasName,
    }: {
      name: string
      aliasName: string
    }): Promise<boolean> => {
      return await contractReadOnly.existURL(name, aliasName)
    },
    getUrl: async ({
      name,
      aliasName,
    }: {
      name: string
      aliasName: string
    }): Promise<string> => {
      const vanityURL = await contractReadOnly.vanityURLs(
        ethers.utils.id(name),
        aliasName
      )
      return vanityURL[0]
    },
  }
}

export default vanityApis

export type VanityURLClient = ReturnType<typeof vanityApis>
