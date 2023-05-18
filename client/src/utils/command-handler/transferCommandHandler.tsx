import React from 'react'
import { BaseText } from '../../components/Text'
import {
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../components/process-status/ProcessStatus'
import { RootStore } from '../../stores/RootStore'
import { EWSTypes } from '../../api/ews/ewsApi'

export const transferDomainCommand = async (
  domainName: string,
  address: string,
  store: RootStore,
  setProcessStatus: React.Dispatch<React.SetStateAction<ProcessStatusItem>>
) => {
  try {
    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: <BaseText>Waiting for a transaction to be signed</BaseText>,
    })
    console.log('transferDomainCommand', domainName, store)
    // const tx = await store.ewsClient.update(
    //   domainName,
    //   subdomain,
    //   EWSTypes.EWS_NOTION,
    //   notionPageId,
    //   internalPageIds,
    //   false
    // )
    //return tx
    return true
  } catch (e) {
    console.log(e)
    setProcessStatus({
      type: ProcessStatusTypes.ERROR,
      render: <BaseText>Error embedding Notion Page</BaseText>,
    })
    return null
  }
}
