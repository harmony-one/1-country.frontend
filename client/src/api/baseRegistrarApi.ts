import { ethers, Contract } from 'ethers'
import { TransactionResponse } from '@ethersproject/abstract-provider'

import config from '../../config'
import erc721Abi from '../../contracts/abi/ERC721'
import { CallbackProps, SendProps, SendResult } from './index'
import { defaultProvider } from './defaultProvider'
import { getUnwrappedTokenId } from './utils'

interface SafeTransferProps extends CallbackProps {
  domain: string
  transferTo: string
  address: string
}

export const baseRegistrarApi = ({
  provider,
  address,
}: {
  provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider
  address: string
}) => {
  const contractReadOnly = new Contract(
    config.domainTransfer.baseRegitrarAddress, //'0x4D64B78eAf6129FaC30aB51E6D2D679993Ea9dDD', //config.domainTransfer.baseRegitrarAddress,
    erc721Abi,
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
    contract,
    address,
    getOwner: async (domain: string): Promise<string> => {
      const tokenId = getUnwrappedTokenId(domain)
      const response = await contractReadOnly.ownerOf(tokenId)
      return response
    },
    isWrapped: async (domain: string, address: string): Promise<boolean> => {
      const tokenId = getUnwrappedTokenId(domain)
      const owner = (await contractReadOnly.ownerOf(tokenId)) as string
      return owner.toUpperCase() === config.nameWrapperContract.toUpperCase()
    },
    safeTransfer: async ({
      transferTo,
      domain,
      address,
      onFailed,
      onSuccess,
      onTransactionHash = () => {},
    }: SafeTransferProps): Promise<SendResult> => {
      try {
        const tokenId = ethers.BigNumber.from(getUnwrappedTokenId(domain))
        const tx = (await contract.transferFrom(
          address,
          transferTo,
          tokenId
        )) as TransactionResponse
        onTransactionHash(tx.hash)
        const txReceipt = await tx.wait()
        onSuccess && onSuccess(txReceipt)
        return { txReceipt: txReceipt, error: null }
      } catch (ex) {
        onFailed && onFailed(ex, true)
        return { txReceipt: null, error: ex }
      }
    },
    isApprovedForAll: async (): Promise<boolean> => {
      console.log('isApprovedForAll', address)
      const response = (await contractReadOnly.isApprovedForAll(
        address,
        config.nameWrapperContract
      )) as boolean
      return response
    },
    setApprovalForAll: async () => {
      return send({
        parameters: [config.nameWrapperContract, true],
        methodName: 'setApprovalForAll',
      })
    },
    getTokenUri: async (domain: string): Promise<string> => {
      const response = await contractReadOnly.tokenURI(
        getUnwrappedTokenId(domain)
      )
      return response
    },
  }
}

export type BaseRegistrarClient = ReturnType<typeof baseRegistrarApi>
