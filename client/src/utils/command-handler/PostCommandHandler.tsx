import React from 'react'
import { BaseText } from '../../components/Text'
import {
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../components/process-status/ProcessStatus'
import { sleep } from '../sleep'
import {
  Widget,
  WidgetListStore,
} from '../../routes/widgetModule/WidgetListStore'
import { isIframeWidget, isRedditUrl, isStakingWidgetUrl } from '../validation'
import { mainApi } from '../../api/mainApi'
import { getElementAttributes } from '../getElAttributes'
import { WalletStore } from '../../stores/WalletStore'
import isValidUrl from 'is-url'
import { loadEmbedJson } from '../../modules/embedly/embedly'

type AddPostHandlerProps = {
  url: string
  fromUrl: boolean
  domainName: string
  subPage: string
  widgetListStore: WidgetListStore
  walletStore: WalletStore
  setProcessStatus: React.Dispatch<React.SetStateAction<ProcessStatusItem>>
}

export const addPostHandler = async ({
  url,
  fromUrl = false,
  domainName,
  subPage,
  walletStore,
  widgetListStore,
  setProcessStatus,
}: AddPostHandlerProps): Promise<boolean> => {
  let result = false
  let widget: Widget
  if (fromUrl) {
    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: <BaseText>Adding post from url</BaseText>,
    })
    await sleep(3000)
  }

  if (isStakingWidgetUrl(url)) {
    widget = {
      type: 'staking',
      value: url,
    }
  } else if (isIframeWidget(url)) {
    const createWidgetRes = await mainApi.addHtmlWidget(
      getElementAttributes(url),
      walletStore.walletAddress
    )

    widget = {
      type: 'iframe',
      value: createWidgetRes.data.id,
    }
  } else {
    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: 'Embedding post',
    })

    if (!isValidUrl(url)) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: 'Invalid URL',
      })
      return result
    }

    if (isRedditUrl(url)) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: 'Incompatible URL. Please try a URL from another website.',
      })
      return result
    }
    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: 'Checking URL',
    })
    await sleep(1000)
    const embedData = await loadEmbedJson(url).catch(() => false)

    if (!embedData) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: `Error processing URL. Please try using another URL`,
      })
      return result
    }

    widget = {
      type: 'url',
      value: url,
    }
  }

  setProcessStatus({
    type: ProcessStatusTypes.PROGRESS,
    render: <BaseText>Waiting for a transaction to be signed</BaseText>,
  })

  try {
    const result = await widgetListStore.createWidget({
      widgets: [widget],
      domainName,
      nameSpace: subPage || '',
      onTransactionHash: () => {
        setProcessStatus({
          type: ProcessStatusTypes.PROGRESS,
          render: <BaseText>Waiting for transaction confirmation</BaseText>,
        })
      },
    })

    if (result.error) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: (
          <BaseText>
            {result.error.message.length > 50
              ? result.error.message.substring(0, 50) + '...'
              : result.error.message}
          </BaseText>
        ),
      })
    } else {
      setProcessStatus({
        type: ProcessStatusTypes.SUCCESS,
        render: <BaseText>Url successfully added</BaseText>,
      })
      return true
    }
  } catch (ex) {
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
  }
  return result
}
