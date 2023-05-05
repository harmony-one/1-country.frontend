import React from 'react'
import { BaseText } from '../../components/Text'
import {
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../components/process-status/ProcessStatus'
import { RootStore } from '../../stores/RootStore'
import { EWSTypes, ewsApi } from '../../api/ews/ewsApi'
import { BN } from 'bn.js'
import { rootStore } from '../../stores'

export const addNotionPageCommand = async (
  domainName: string,
  subdomain: string,
  notionPageId: string,
  store: RootStore,
  setProcessStatus: React.Dispatch<React.SetStateAction<ProcessStatusItem>>
) => {
  try {
    console.log('addNotionPageCommand', notionPageId)
    const tx = await store.ewsClient.update(
      domainName,
      subdomain,
      EWSTypes.EWS_NOTION,
      notionPageId,
      [],
      false
    )
    console.log('HELLO', tx)
    return true
  } catch (e) {
    console.log(e)
    setProcessStatus({
      type: ProcessStatusTypes.ERROR,
      render: <BaseText>Error embedding Notion Page</BaseText>,
    })
    return false
  }
}
