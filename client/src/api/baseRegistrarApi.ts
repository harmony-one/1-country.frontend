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
}

export const baseRegistrarApi = ({
  provider,
  address,
}: {
  provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider
  address: string
}) => {
  const contractReadOnly = new Contract(
    config.domainTransfer.baseRegitrarAddress,
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
      // console.log('getOwner', domain, response, config.domainTransfer.baseRegitrarAddress, tokenId)
      return response
    },
    isWrapped: async (domain: string): Promise<boolean> => {
      const tokenId = getUnwrappedTokenId(domain)
      const owner = (await contractReadOnly.ownerOf(tokenId)) as string
      return owner.toUpperCase() === config.nameWrapperContract.toUpperCase()
    },
    safeTransfer: async ({
      transferTo,
      domain,
      onFailed,
      onSuccess,
      onTransactionHash,
    }: SafeTransferProps) => {
      console.log(
        'safeTransfer',
        address,
        transferTo,
        ethers.BigNumber.from(getUnwrappedTokenId(domain))
      )
      console.log({ contract })
      // const tokenId = getUnwrappedTokenId(domain)
      // console.log(domain, tokenId)
      // const response = await contractReadOnly.ownerOf(tokenId)
      // console.log('HELOOOOOOO', response)
      // const tx = await contract.safeTransferFrom(address, transferTo, ethers.BigNumber.from(getUnwrappedTokenId(domain)).toString());
      // await tx.wait();
      // return tx

      return send({
        parameters: [
          address,
          transferTo,
          ethers.BigNumber.from(getUnwrappedTokenId(domain)),
        ],
        methodName: 'safeTransferFrom',
        onFailed,
        onSuccess,
        onTransactionHash,
      })
    },
    isApprovedForAll: async (): Promise<string> => {
      const response = await contractReadOnly.isApprovedForAll(
        address,
        config.nameWrapperContract
      )
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
