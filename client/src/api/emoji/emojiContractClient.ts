import { ethers, Contract } from 'ethers'
import { TransactionResponse } from '@ethersproject/abstract-provider'

import config from '../../../config'
import EmojiAbi from '../../../abi/Emoji'
import { defaultProvider } from '../defaultProvider'
import { CallbackProps, SendProps, SendResult } from '../index'

export enum EmojiType {
  ONE_ABOVE,
  FIRST_PRIZE,
  ONE_HUNDRED_PERCENT,
}

export interface EmojiInfo {
  emojiType: EmojiType
  owner: string
}

interface AddEmojiProps extends CallbackProps {
  name: string
  emojiType: EmojiType
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
    config.emoji.contractEmoji,
    EmojiAbi,
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
    addEmojiReaction: async ({
      name,
      emojiType,
      price,
      onFailed,
      onSuccess,
      onTransactionHash,
    }: AddEmojiProps) => {
      return send({
        parameters: [name, emojiType, ethers.utils.parseEther(price)],
        methodName: 'addEmojiReaction',
        onFailed,
        onSuccess,
        onTransactionHash,
      })
    },
    transferEmojiReactions: async ({
      name,
      receiver,
    }: {
      name: string
      receiver: string
    }) => {
      contractReadOnly.transferEmojiReactions(name, receiver)
    },
    getEmojiReactions: async ({
      name,
    }: {
      name: string
    }): Promise<EmojiInfo[]> => {
      return await contractReadOnly.getEmojiReactions(name)
    },
    setRevenueAccount: async ({ account }: { account: string }) => {
      contractReadOnly.setRevenueAccount(account)
    },
  }
}

export default vanityApis

export type VanityURLClient = ReturnType<typeof vanityApis>
