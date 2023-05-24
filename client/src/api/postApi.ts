import config from '../../config'
import PostAbi from '../../abi/Post'
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider'
import { CallbackProps, SendProps } from './index'
import { defaultProvider } from './defaultProvider'
import { BigNumber, Contract, ethers } from 'ethers'

const { postContract } = config

console.log('Post CONTRACT ADDRESS', postContract)

export interface SendResult {
  txReceipt: TransactionReceipt
  error: Error
}
interface UpdatePostProps extends CallbackProps {
  name: string
  newUrl: string
  postId: number
}

interface AddPostProps extends CallbackProps {
  name: string
  urls: string[]
  nameSpace: string
}

interface DeletePostProps extends CallbackProps {
  name: string
  postIds: BigNumber[]
}

interface TransferPostOwnershipProps extends CallbackProps {
  name: string
  receiver: string
  isAllNameSpace: boolean
  nameSpace: string
}

export interface PostInfo {
  postId: BigNumber // starts from 0
  url: string
  nameSpace: string
  owner: string
}

const postApi = ({
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

  const contractReadOnly = new Contract(postContract, PostAbi, defaultProvider)

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
    updatePost: async ({
      // updateURL
      name,
      newUrl,
      postId,
      onFailed,
      onSuccess,
      onTransactionHash,
    }: UpdatePostProps) => {
      return send({
        parameters: [name, newUrl, postId],
        methodName: 'updatePost',
        onFailed,
        onSuccess,
        onTransactionHash,
      })
    },
    getPostCount({ name }: { name: string }) {
      //numUrls
      return contractReadOnly.getPostCount(name)
    },
    deletePost: ({
      //removeRecordUrl
      name,
      postIds,
      onFailed,
      onSuccess,
      onTransactionHash,
    }: DeletePostProps) => {
      return send({
        parameters: [name, postIds],
        methodName: 'deletePost',
        onFailed,
        onSuccess,
        onTransactionHash,
      })
    },
    // clearUrls({ name }: { name: string }) {
    //   return contractReadOnly.clearUrls(name)
    // },
    addNewPost: ({
      //addRecordUrl
      name,
      urls,
      nameSpace,
      onFailed,
      onSuccess,
      onTransactionHash,
    }: AddPostProps) => {
      console.log('before add post')
      return send({
        // amount,
        parameters: [name, urls, nameSpace],
        methodName: 'addNewPost',
        onFailed,
        onSuccess,
        onTransactionHash,
      })
    },
    trasnferPostOwnership: async ({
      name,
      receiver,
      isAllNameSpace,
      nameSpace,
      onFailed,
      onSuccess,
      onTransactionHash,
    }: TransferPostOwnershipProps) => {
      // getRecordUrlList
      return send({
        parameters: [name, receiver, isAllNameSpace, nameSpace],
        methodName: 'trasnferPostOwnership',
        onFailed,
        onSuccess,
        onTransactionHash,
      })
    },
    getPosts: async ({ name }: { name: string }): Promise<PostInfo[]> => {
      // getRecordUrlList
      return contractReadOnly.getPosts(name)
    },
    // baseRentalPrice: () => {
    //   return contractReadOnly.baseRentalPrice()
    // },
  }
}

if (window) {
  // @ts-expect-error
  window.postApi = postApi
}

export default postApi

export type PostClient = ReturnType<typeof postApi>
