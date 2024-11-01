import React from 'react'
import { BaseText } from '../../components/Text'
import {
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../components/process-status/ProcessStatus'
import { RootStore } from '../../stores/RootStore'
import config from '../../../config'
import logger from '../../modules/logger'
import {
  WidgetListStore,
  Widget,
} from '../../routes/widgetModule/WidgetListStore'

const log = logger.module('bondingCurveHandler')

type BondingCurveHandlerProps = {
  fromUrl: boolean
  name: string
  symbol: string
  domainName: string
  rootStore: RootStore
  widgetListStore: WidgetListStore
  setProcessStatus: React.Dispatch<React.SetStateAction<ProcessStatusItem>>
}

export const bondingCurveHandler = async ({
  domainName,
  name,
  symbol,
  rootStore,
  widgetListStore,
  setProcessStatus,
  fromUrl = false,
}: BondingCurveHandlerProps): Promise<boolean> => {
  let result = false
  let widget: Widget
  const bondingCurveClient = rootStore.bondingCurveClient

  const nameExists = await bondingCurveClient.isTokenNameTaken(name)

  if (nameExists) {
    setProcessStatus({
      type: ProcessStatusTypes.ERROR,
      render: <BaseText>Meme Coin name taken</BaseText>,
    })
    return result
  }

  const memeTokenResult = await bondingCurveClient.createToken({
    name,
    symbol: symbol.toLocaleUpperCase(),
    onTransactionHash: () => {
      setProcessStatus({
        type: ProcessStatusTypes.PROGRESS,
        render: <BaseText>Waiting for transaction confirmation</BaseText>,
      })
    },
    onSuccess: ({ transactionHash }) => {
      console.log('success', transactionHash)
      setProcessStatus({
        type: ProcessStatusTypes.SUCCESS,
        render: <BaseText>Meme token created... Processing widget</BaseText>,
      })
    },
    onFailed: (ex: Error) => {
      log.error('bondingCurveHandler', {
        error: ex,
        memeCoinName: name,
        domain: `${domainName.toLowerCase()}${config.tld}`,
      })
      console.log('ERRROR', ex)
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: <BaseText>Processing Meme Coin creation</BaseText>,
      })
    },
  })
  if (memeTokenResult.error) {
    return result
  }
  widget = {
    type: 'meme',
    value: memeTokenResult.tokenAddress,
  }
  try {
    const widgetResult = await widgetListStore.createWidget({
      widgets: [widget],
      domainName,
      nameSpace: '',
      onTransactionHash: () => {
        setProcessStatus({
          type: ProcessStatusTypes.PROGRESS,
          render: <BaseText>Creating Meme Widget</BaseText>,
        })
      },
    })

    if (widgetResult.error) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: (
          <BaseText>
            {widgetResult.error.message.length > 50
              ? widgetResult.error.message.substring(0, 50) + '...'
              : widgetResult.error.message}
          </BaseText>
        ),
      })
    } else {
      setProcessStatus({
        type: ProcessStatusTypes.SUCCESS,
        render: <BaseText>Widget Created</BaseText>,
      })
      result = true
    }
  } catch (ex) {
    log.error('addPostHandler', {
      error: ex,
      domain: `${domainName.toLowerCase()}${config.tld}`,
      url: 'Meme Creation',
      subPage: '',
      wallet: rootStore.walletStore.walletAddress,
    })
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
