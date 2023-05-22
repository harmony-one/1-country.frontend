import { ethers, Contract } from 'ethers'
import { TransactionResponse } from '@ethersproject/abstract-provider'

import config from '../../config'
import NameWrapper from '../../contracts/abi/NameWrapper'
import { CallbackProps, SendProps, SendResult } from './index'
import { defaultProvider } from './defaultProvider'
import { getUnwrappedTokenId, getWrappedTokenId } from './utils'

interface SafeTransferProps extends CallbackProps {
  domain: string
  transferTo: string
}

interface UnwrapETH2LDProps extends CallbackProps {
  domain: string
}

export const nameWrapperApi = ({
  provider,
  address,
}: {
  provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider
  address: string
}) => {
  const contractReadOnly = new Contract(
    config.nameWrapperContract,
    NameWrapper,
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
    getWrappedOwner: async (domain: string): Promise<string> => {
      const response = await contractReadOnly.ownerOf(getWrappedTokenId(domain))
      return response
    },
    getWrappedTokenUri: async (domain: string): Promise<string> => {
      const response = await contractReadOnly.uri(getWrappedTokenId(domain))
      return response
    },
    safeTransfer: async ({
      transferTo,
      domain,
      onFailed,
      onSuccess,
      onTransactionHash,
    }: SafeTransferProps) => {
      return send({
        parameters: [address, transferTo, getWrappedTokenId(domain), 1, '0x'],
        methodName: 'safeTransferFrom',
        onFailed,
        onSuccess,
        onTransactionHash,
      })
    },
    unwrapETH2LD: async ({
      domain,
      onFailed,
      onSuccess,
      onTransactionHash,
    }: UnwrapETH2LDProps) => {
      return send({
        parameters: [getUnwrappedTokenId(domain), address, address],
        methodName: 'unwrapETH2LD',
        onFailed,
        onSuccess,
        onTransactionHash,
      })
    },
    wrapETH2LD: async ({
      domain,
      onFailed,
      onSuccess,
      onTransactionHash,
    }: UnwrapETH2LDProps) => {
      return send({
        parameters: [
          domain,
          address,
          0,
          '0xFFFFFFFFFFFFFFFF',
          config.domainTransfer.resolverAddress,
        ],
        methodName: 'wrapETH2LD',
        onFailed,
        onSuccess,
        onTransactionHash,
      })
    },
  }
}

export type NameWrapperClient = ReturnType<typeof nameWrapperApi>
