import React, { useEffect, useState } from 'react'
import { rootStore, useStores } from '../../stores'
import {
  PageWidgetContainer,
  WidgetInputContainer,
} from '../../components/page-widgets/PageWidgets.styles'
import { observer } from 'mobx-react-lite'
import { Widget, widgetListStore } from './WidgetListStore'
import { TransactionWidget } from '../../components/widgets/TransactionWidget'
import { Transaction } from '../../api'
import isUrl from 'is-url'
import { MetamaskWidget } from '../../components/widgets/MetamaskWidget'
import { WalletConnectWidget } from '../../components/widgets/WalletConnectWidget'
import {
  ProcessStatus,
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../components/process-status/ProcessStatus'
import { sleep } from '../../utils/sleep'
import { SearchInput } from '../../components/search-input/SearchInput'
import { MediaWidget } from '../../components/widgets/MediaWidget'
import { loadEmbedJson } from '../../modules/embedly/embedly'

const defaultFormFields = {
  widgetValue: '',
}

interface Props {
  domainName: string
}

export const WidgetModule: React.FC<Props> = observer(({ domainName }) => {
  const { domainStore, walletStore } = useStores()
  const [processStatus, setProcessStatus] = useState<ProcessStatusItem>({
    type: ProcessStatusTypes.INFO,
    render: '',
  })

  useEffect(() => {
    domainStore.loadDomainRecord(domainName)
  }, [domainName])

  useEffect(() => {
    widgetListStore.loadWidgetList(domainName)
    widgetListStore.loadDomainTx(domainName)
  }, [domainName])

  const [loading, setLoading] = useState(false)
  const [formFields, setFormFields] = useState(defaultFormFields)

  const terminateProcess = async (timer: number = 5000) => {
    await sleep(timer)
    setLoading(false)
    setProcessStatus({ type: ProcessStatusTypes.INFO, render: '' })
  }

  const onSuccess = (message: string) => (tx: Transaction) => {
    setProcessStatus({
      type: ProcessStatusTypes.SUCCESS,
      render: message,
    })

    terminateProcess(3000)
  }

  const onFailed = () => (ex: Error) => {
    setProcessStatus({
      type: ProcessStatusTypes.ERROR,
      render: ex.message,
    })
  }

  const enterHandler = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return
    }
    event.preventDefault()
    const value = (event.target as HTMLInputElement).value || ''

    if (/^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/.test(value)) {
      window.open(`mailto:1country@harmony.one`, '_self')
      return
    }
    setLoading(true)

    if (!isUrl(value)) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: 'It should be valid URL',
      })
      terminateProcess()
      return
    }

    const embedData = await loadEmbedJson(value).catch(() => false)

    if (!embedData) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: `Sorry, we can't embed this URL`,
      })
      terminateProcess()
      return
    }
    // const tweet = parseInputValue(value)
    //
    // if (tweet.error) {
    //   setProcessStatus({
    //     type: ProcessStatusTypes.ERROR,
    //     render: tweet.error,
    //   })
    //   terminateProcess()
    //   return
    // }

    const widget: Widget = {
      type: 'url',
      value: value,
    }

    widgetListStore
      .createWidget({
        widget,
        domainName,
        onSuccess: onSuccess('Url successful added'),
        onFailed: onFailed(),
      })
      .then(() => {
        setFormFields({ ...formFields, widgetValue: '' })
        terminateProcess()
      })
  }

  const onChange = (value: string) => {
    setFormFields({ ...formFields, widgetValue: value })
  }

  const deleteWidget = (widgetId: number) => {
    setLoading(true)
    widgetListStore.deleteWidget({
      domainName,
      widgetId,
      onSuccess: onSuccess('Widget deleted'),
      onFailed: onFailed(),
    })
  }

  const handleDeleteLegacyUrl = async () => {
    setLoading(true)

    try {
      await rootStore.d1dcClient.updateURL({
        name: domainName,
        url: '',
        onSuccess: onSuccess('Widget deleted'),
        onFailed: onFailed(),
      })

      domainStore.loadDomainRecord(domainName)
    } catch (ex) {
      terminateProcess()
    }
  }

  const showInput = walletStore.isConnected && domainStore.isOwner

  return (
    <PageWidgetContainer>
      {showInput && (
        <WidgetInputContainer>
          <SearchInput
            autoFocus
            disabled={loading}
            placeholder={'Tweet link'}
            value={formFields.widgetValue}
            onSearch={onChange}
            onKeyDown={enterHandler}
          />
        </WidgetInputContainer>
      )}

      {loading && <ProcessStatus status={processStatus} />}

      {widgetListStore.widgetList.map((widget, index) => (
        <MediaWidget
          value={widget.value}
          key={index}
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
          loading={widgetListStore.txDomainLoading}
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
