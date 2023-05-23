import React from 'react'
import { BaseText } from '../../components/Text'
import {
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../components/process-status/ProcessStatus'
import { RootStore } from '../../stores/RootStore'
import { EWSTypes } from '../../api/ews/ewsApi'

export const addNotionPageCommand = async (
  domainName: string,
  subdomain: string,
  notionPageId: string,
  internalPageIds: string[],
  store: RootStore,
  setProcessStatus: React.Dispatch<React.SetStateAction<ProcessStatusItem>>
) => {
  try {
    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: <BaseText>Waiting for a transaction to be signed</BaseText>,
    })
    const tx = await store.ewsClient.update(
      domainName,
      subdomain,
      EWSTypes.EWS_NOTION,
      notionPageId,
      internalPageIds,
      false
    )
    console.log('addNotionPageCommand tx', tx)
    return tx
  } catch (e) {
    console.log(e)
    setProcessStatus({
      type: ProcessStatusTypes.ERROR,
      render: <BaseText>Error embedding Notion Page</BaseText>,
    })
    return null
  }
}
