import React from 'react'

import { BaseText } from '../../components/Text'
import {
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../components/process-status/ProcessStatus'
import { RootStore } from '../../stores/RootStore'
import config from '../../../config'
import { sleep } from '../sleep'

type DomainWrapperUnwrapperProps = {
  fromUrl: boolean
  domainName: string
  rootStore: RootStore
  walletAddress: string
  setProcessStatus: React.Dispatch<React.SetStateAction<ProcessStatusItem>>
}

type TransferDomainProps = {
  fromUrl: boolean
  domainName: string
  transferTo: string
  rootStore: RootStore
  walletAddress: string
  setProcessStatus: React.Dispatch<React.SetStateAction<ProcessStatusItem>>
}

export const domainWrapperHandler = async ({
  fromUrl = false,
  domainName,
  rootStore,
  walletAddress,
  setProcessStatus,
}: DomainWrapperUnwrapperProps): Promise<boolean> => {
  let result = false
  const baseRegistrar = rootStore.baseRegistrar
  const nameWrapper = rootStore.nameWrapper
  console.log('wallet address', walletAddress)
  try {
    if (fromUrl) {
      setProcessStatus({
        type: ProcessStatusTypes.PROGRESS,
        render: <BaseText>Wrapping domain from url</BaseText>,
      })
      await sleep(3000)
    }

    const wrapped = await baseRegistrar.isWrapped(domainName, walletAddress)
    if (wrapped) {
      const resp = await nameWrapper.unwrapETH2LD({
        domain: domainName,
        address: walletAddress,
        onTransactionHash: () => {
          setProcessStatus({
            type: ProcessStatusTypes.PROGRESS,
            render: <BaseText>Waiting for transaction confirmation</BaseText>,
          })
        },
        onSuccess: () => {
          setProcessStatus({
            type: ProcessStatusTypes.SUCCESS,
            render: <BaseText>Domain unwrap completed</BaseText>,
          })
        },
        onFailed: (ex: Error) => {
          console.log('safeTransfer ERROR', ex)
          setProcessStatus({
            type: ProcessStatusTypes.ERROR,
            render: <BaseText>Domain unwrap failed</BaseText>,
          })
        },
      })
      if (!resp.error) {
        return true
      }
    } else {
      const approved = await baseRegistrar.isApprovedForAll()
      console.log('approved', approved)
      if (!approved) {
        setProcessStatus({
          type: ProcessStatusTypes.PROGRESS,
          render: (
            <BaseText>
              Confirming this transaction will allow a third party to access and
              transfer the following NFTs without further notice until you
              revoke its access
            </BaseText>
          ),
        })
        await baseRegistrar.setApprovalForAll()
      }
      const resp = await nameWrapper.wrapETH2LD({
        domain: domainName,
        address: walletAddress,
        onTransactionHash: () => {
          setProcessStatus({
            type: ProcessStatusTypes.PROGRESS,
            render: <BaseText>Waiting for transaction confirmation</BaseText>,
          })
        },
        onSuccess: () => {
          setProcessStatus({
            type: ProcessStatusTypes.SUCCESS,
            render: <BaseText>Domain wrap completed</BaseText>,
          })
        },
        onFailed: (ex: Error) => {
          console.log('safeTransfer ERROR', ex)
          setProcessStatus({
            type: ProcessStatusTypes.ERROR,
            render: <BaseText>Domain wrap failed</BaseText>,
          })
        },
      })
      console.log('nameWrapper.wrapETH2LD', resp)
      if (!resp.error) {
        return true
      }
    }
  } catch (e) {}
  return result
}

export const transferDomainHandler = async ({
  fromUrl = false,
  domainName,
  rootStore,
  transferTo,
  walletAddress,
  setProcessStatus,
}: TransferDomainProps): Promise<boolean> => {
  let result = false
  const baseRegistrar = rootStore.baseRegistrar
  const nameWrapper = rootStore.nameWrapper

  try {
    const wrapped = await baseRegistrar.isWrapped(domainName, walletAddress)
    if (fromUrl) {
      setProcessStatus({
        type: ProcessStatusTypes.PROGRESS,
        render: <BaseText>Transfer domain from url</BaseText>,
      })
      await sleep(3000)
    }
    if (wrapped) {
      const resp = await nameWrapper.safeTransfer({
        transferTo,
        domain: domainName,
        address: walletAddress,
        onTransactionHash: () => {
          setProcessStatus({
            type: ProcessStatusTypes.PROGRESS,
            render: <BaseText>Waiting for transaction confirmation</BaseText>,
          })
        },
        onSuccess: () => {
          setProcessStatus({
            type: ProcessStatusTypes.SUCCESS,
            render: <BaseText>Transfer completed</BaseText>,
          })
        },
        onFailed: (ex: Error) => {
          console.log('safeTransfer ERROR', ex)
          setProcessStatus({
            type: ProcessStatusTypes.ERROR,
            render: <BaseText>Transfer failed</BaseText>,
          })
        },
      })
      console.log(resp)
      if (!resp.error) {
        return true
      }
    } else {
      const resp = await baseRegistrar.safeTransfer({
        transferTo: transferTo,
        domain: domainName,
        address: walletAddress,
        onTransactionHash: () => {
          setProcessStatus({
            type: ProcessStatusTypes.PROGRESS,
            render: <BaseText>Waiting for transaction confirmation</BaseText>,
          })
        },
        onSuccess: () => {
          setProcessStatus({
            type: ProcessStatusTypes.SUCCESS,
            render: <BaseText>Transfer completed</BaseText>,
          })
        },
        onFailed: (ex: Error) => {
          console.log('safeTransfer ERROR', ex)
          setProcessStatus({
            type: ProcessStatusTypes.ERROR,
            render: <BaseText>Transfer failed</BaseText>,
          })
        },
      })
      console.log(resp)
      if (!resp.error) {
        return true
      }
    }
    return result
  } catch (e) {
    console.log(e)
    setProcessStatus({
      type: ProcessStatusTypes.ERROR,
      render: <BaseText>Error transfering the domain</BaseText>,
    })
    return result
  }
}
