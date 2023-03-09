import React, { useEffect, useState } from 'react'
import { rootStore, useStores } from '../../stores'
import {
  PageWidgetContainer,
  WidgetInputContainer,
} from '../../components/page-widgets/PageWidgets.styles'
import { observer } from 'mobx-react-lite'
import { Widget, widgetListStore } from './WidgetListStore'
import { TransactionWidget } from '../../components/widgets/TransactionWidget'
import isValidUrl from 'is-url'
import { MetamaskWidget } from '../../components/widgets/MetamaskWidget'
import { WalletConnectWidget } from '../../components/widgets/WalletConnectWidget'
import {
  ProcessStatus,
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../components/process-status/ProcessStatus'
import { SearchInput } from '../../components/search-input/SearchInput'
import { MediaWidget } from '../../components/widgets/MediaWidget'
import { loadEmbedJson } from '../../modules/embedly/embedly'
import {
  isEmail,
  isValidInstagramUri,
  isValidTwitUri,
} from '../../utils/validation'
import { BaseText } from '../../components/Text'
import {Box} from "grommet";


const defaultFormFields = {
  widgetValue: '',
}

interface Props {
  domainName: string
}

export const WidgetModule: React.FC<Props> = observer(({ domainName }) => {
  const { domainStore, walletStore } = useStores()
  const [processStatus, setProcessStatus] = useState<ProcessStatusItem>({
    type: ProcessStatusTypes.IDLE,
    render: '',
  })

  useEffect(() => {
    domainStore.loadDomainRecord(domainName)
  }, [domainName])

  useEffect(() => {
    widgetListStore.loadWidgetList(domainName)
    widgetListStore.loadDomainTx(domainName)
  }, [domainName])

  const [isLoading, setLoading] = useState(false)
  const [formFields, setFormFields] = useState(defaultFormFields)

  const resetProcessStatus = (time = 2000) => {
    setTimeout(() => {
      setProcessStatus({
        type: ProcessStatusTypes.IDLE,
        render: '',
      })
    }, time)
  }

  const resetInput = () => {
    setFormFields({ ...formFields, widgetValue: '' })
  }

  const enterHandler = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return
    }
    event.preventDefault()
    const value = (event.target as HTMLInputElement).value || ''

    if (isEmail(value)) {
      window.open(`mailto:1country@harmony.one`, '_self')
      return
    }
    setLoading(true)

    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: 'Embedding post',
    })

    if (!isValidUrl(value)) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: 'Invalid URL',
      })
      setLoading(false)
      return
    }

    const isTwit = isValidTwitUri(value)
    const isInst = isValidInstagramUri(value)

    if (!isInst && !isTwit) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: 'Invalid URL',
      })
      setLoading(false)
      return
    }

    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: 'Checking URL',
    })

    const embedData = await loadEmbedJson(value).catch(() => false)

    if (!embedData) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: `Sorry, we can't embed this URL`,
      })
      setLoading(false)
      return
    }

    const widget: Widget = {
      type: 'url',
      value: value,
    }

    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: <BaseText>Waiting for a transaction to be signed</BaseText>,
    })

    try {
      const result = await widgetListStore.createWidget({
        widget,
        domainName,
        onTransactionHash: () => {
          setProcessStatus({
            type: ProcessStatusTypes.PROGRESS,
            render: <BaseText>Waiting for transaction confirmation</BaseText>,
          })
        },
      })

      setLoading(false)

      if (result.error) {
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: <BaseText>{result.error.message}</BaseText>,
        })
        return
      }
      setProcessStatus({
        type: ProcessStatusTypes.SUCCESS,
        render: <BaseText>Url successfully added</BaseText>,
      })
      resetProcessStatus()
      resetInput()
    } catch (ex) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: <BaseText>{ex.message}</BaseText>,
      })
      setLoading(false)
    }
  }

  const onChange = (value: string) => {
    setFormFields({ ...formFields, widgetValue: value })
    if(!value) {
      resetProcessStatus(0)
    }
  }

  const deleteWidget = async (widgetId: number) => {
    setLoading(true)

    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: <BaseText>Waiting for a transaction to be signed</BaseText>,
    })

    try {
      const result = await widgetListStore.deleteWidget({
        domainName,
        widgetId,
        onTransactionHash: () => {
          setProcessStatus({
            type: ProcessStatusTypes.PROGRESS,
            render: <BaseText>Waiting for transaction confirmation</BaseText>,
          })
        },
      })
      setLoading(false)

      if (result.error) {
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: <BaseText>{result.error.message}</BaseText>,
        })
        return
      }

      setProcessStatus({
        type: ProcessStatusTypes.SUCCESS,
        render: <BaseText>Url successfully removed</BaseText>,
      })

      resetProcessStatus()
    } catch (ex) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: <BaseText>{ex.message}</BaseText>,
      })
      setLoading(false)
    }
  }

  const handleDeleteLegacyUrl = async () => {
    setLoading(true)

    try {
      const updateResult = await rootStore.tweetClient.updateURL({
        name: domainName,
        url: '',
        onTransactionHash: () => {
          setProcessStatus({
            type: ProcessStatusTypes.PROGRESS,
            render: <BaseText>Waiting for transaction confirmation</BaseText>,
          })
        },
      })

      if (updateResult.error) {
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: updateResult.error.message,
        })
        setLoading(false)
        return
      }

      setProcessStatus({
        type: ProcessStatusTypes.SUCCESS,
        render: <BaseText>Post deleted</BaseText>,
      })
      setLoading(false)

      resetProcessStatus()

      domainStore.loadDomainRecord(domainName)
    } catch (ex) {
      setLoading(false)
    }
  }

  const showInput = walletStore.isConnected && domainStore.isOwner

  return (
    <PageWidgetContainer>
      {showInput && (
        <WidgetInputContainer>
          <SearchInput
            autoFocus
            disabled={isLoading}
            isValid={processStatus.type !== ProcessStatusTypes.ERROR}
            placeholder={'Enter tweet or instagram post url'}
            value={formFields.widgetValue}
            onSearch={onChange}
            onKeyDown={enterHandler}
          />

          {processStatus.type !== ProcessStatusTypes.IDLE &&
            <Box align={'center'} margin={{ top: '8px' }}>
              <ProcessStatus status={processStatus} />
            </Box>
          }
        </WidgetInputContainer>
      )}

      {widgetListStore.widgetList.map((widget, index) => (
        <MediaWidget
          value={widget.value}
          key={index + widget.value}
          isOwner={domainStore.isOwner}
          onDelete={() => deleteWidget(widget.id)}
        />
      ))}

      {domainStore.domainRecord && domainStore.domainRecord.url && (
        <MediaWidget
          value={domainStore.domainRecord.url}
          isOwner={domainStore.isOwner}
          onDelete={handleDeleteLegacyUrl}
        />
      )}

      {domainStore.domainRecord && (
        <TransactionWidget
          name={domainStore.domainName}
          isLoading={widgetListStore.txDomainLoading}
          domainRecord={domainStore.domainRecord}
          txHash={widgetListStore.txDomain}
        />
      )}

      {!walletStore.isConnected && walletStore.isMetamaskAvailable && (
        <MetamaskWidget />
      )}
      {!walletStore.isMetamaskAvailable && <WalletConnectWidget />}
    </PageWidgetContainer>
  )
})
