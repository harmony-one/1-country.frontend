import React from 'react'

import { BaseText } from '../../components/Text'
import {
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../components/process-status/ProcessStatus'
import { RootStore } from '../../stores/RootStore'
import config from '../../../config'
import { sleep } from '../sleep'

type TransferDomainProps = {
  fromUrl: boolean
  domainName: string
  transferTo: string
  rootStore: RootStore
  setProcessStatus: React.Dispatch<React.SetStateAction<ProcessStatusItem>>
}

export const transferDomainHandler = async ({
  fromUrl = false,
  domainName,
  rootStore,
  transferTo,
  setProcessStatus,
}: TransferDomainProps): Promise<boolean> => {
  let result = false
  const baseRegistrar = rootStore.baseRegistrar
  const nameWrapper = rootStore.nameWrapper

  try {
    const wrapped = await baseRegistrar.isWrapped(domainName)
    console.log(
      'is wrapped',
      domainName,
      wrapped,
      config.nameWrapperContract,
      wrapped
    )
    console.log('wrapped comparsion', config.nameWrapperContract)
    if (fromUrl) {
      setProcessStatus({
        type: ProcessStatusTypes.PROGRESS,
        render: <BaseText>Transfer domain from url</BaseText>,
      })
      await sleep(3000)
    }
    if (wrapped) {
      console.log('nameWrapper.safeTransfer', transferTo, domainName)
      const resp = await nameWrapper.safeTransfer({
        transferTo,
        domain: domainName,
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
      console.log('baseRegistrar.safeTransfer', transferTo, domainName)
      const resp = await baseRegistrar.safeTransfer({
        transferTo: transferTo,
        domain: domainName,
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
