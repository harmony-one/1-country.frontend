import React from 'react'
import { BaseText } from '../../components/Text'
import {
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../components/process-status/ProcessStatus'
import { RootStore } from '../../stores/RootStore'
import { BN } from 'bn.js'

export const renewCommand = async (
  domainName: string,
  price: string,
  store: RootStore,
  setProcessStatus: React.Dispatch<React.SetStateAction<ProcessStatusItem>>
) => {
  try {
    const rentResult = await store.d1dcClient.renewDomain({
      name: domainName.toLowerCase(),
      amount: new BN(price).toString(),
      onTransactionHash: () => {
        setProcessStatus({
          type: ProcessStatusTypes.PROGRESS,
          render: <BaseText>Waiting for transaction confirmation</BaseText>,
        })
      },
      onSuccess: () => {
        setProcessStatus({
          type: ProcessStatusTypes.SUCCESS,
          render: <BaseText>Domain renewed</BaseText>,
        })
      },
      onFailed: (ex: Error) => {
        console.log('ERROR', ex)
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: (
            <BaseText>
              {ex.message.length > 50
                ? ex.message.substring(0, 50) + '...'
                : ex.message}
            </BaseText>
          ),
        })
      },
    })
    return rentResult
  } catch (e) {
    console.log('rent', e)
    return {
      error: e,
    }
  }
}
