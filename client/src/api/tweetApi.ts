import BN from 'bn.js'
import config from '../../config'
import TweetAbi from '../../abi/Tweet'
import Web3 from 'web3'
import { TransactionReceipt } from 'web3-core'
import {CallbackProps, SendProps} from "./index";

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

const tweetApi = ({ web3, address }: { web3: Web3; address: string }) => {
  // console.log('apis', web3, address)
  if (!web3) {
    return
  }

  const contract = new web3.eth.Contract(TweetAbi, tweetContractAddress)

  const send = async ({
                        amount,
                        onFailed,
                        onTransactionHash = () => {},
                        onSuccess,
                        methodName,
                        parameters,
                      }: SendProps): Promise<SendResult> => {
    console.log({ methodName, parameters, amount, address })

    try {
      const tx = await contract.methods[methodName](...parameters)
        .send({
          from: address,
          value: amount,
        })
        .on('transactionHash', onTransactionHash)
      if (config.debug) {
        console.log(methodName, JSON.stringify(tx))
      }
      console.log(methodName, tx?.events)
      onSuccess && onSuccess(tx)
      return { txReceipt: tx, error: null }
    } catch (ex) {
      onFailed && onFailed(ex, true)
      return { txReceipt: null, error: ex }
    }
  }

  return {
    address,
    contract,
    web3,
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
    // updateURL: async ({
    //                     name,
    //                     url,
    //                     onFailed,
    //                     onSuccess,
    //                     onTransactionHash,
    //                   }: UpdateUrlProps) => {
    //   return send({
    //     parameters: [name, url],
    //     methodName: 'updateURL',
    //     onFailed,
    //     onSuccess,
    //     onTransactionHash,
    //   })
    // },
    numUrls ({ name }: { name: string }) {
      return contract.methods.numUrls(name).call()
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
    clearUrls ({ name }: { name: string }) {
      return contract.methods.clearUrls(name).call()
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
      return contract.methods.getAllUrls(name).call()
    },
    isActivated: async (name: string) => {
      const nameBytes = web3.utils.keccak256(name)
      const active = await contract.methods.activated(nameBytes).call()
      return active.toString().toLowerCase() === 'true'
    },
    getBasePrice: async () => {
      return new BN(await contract.methods.baseRentalPrice().call()).toString()
    },
  }
}

if (window) {
  // @ts-expect-error
  window.tweetApi = tweetApi
}

export default tweetApi

export type TweetClient = ReturnType<typeof tweetApi>
