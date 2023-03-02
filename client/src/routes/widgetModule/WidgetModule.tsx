import React, { useEffect, useState } from 'react'
import { rootStore, useStores } from '../../stores'
import {
  PageWidgetContainer,
  WidgetInputContainer,
  WidgetStyledInput,
} from '../../components/page-widgets/PageWidgets.styles'
import TwitterWidget, {
  parseInputValue,
} from '../../components/widgets/TwitterWidget'
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
  }

  const onFailed = () => (ex: Error) => {
    setProcessStatus({
      type: ProcessStatusTypes.ERROR,
      render: ex.message,
    })
  }

  const enterHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return
    }
    event.preventDefault()

    if (
      /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/.test(
        event.currentTarget.value
      )
    ) {
      window.open(`mailto:1country@harmony.one`, '_self')
      return
    }
    setLoading(true)

    const tweet = parseInputValue(event.currentTarget.value)

    if (tweet.error) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: tweet.error,
      })
      terminateProcess()
      return
    }

    const value = isUrl(event.currentTarget.value)
      ? event.currentTarget.value
      : tweet.value

    const widget: Widget = {
      type: 'twitter',
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

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormFields({ ...formFields, [name]: value })
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
          <WidgetStyledInput
            placeholder="Twitter handle or tweet link"
            name="widgetValue"
            value={formFields.widgetValue}
            required
            onChange={onChange}
            onKeyDown={enterHandler}
            disabled={loading}
            autoFocus
            valid
          />
        </WidgetInputContainer>
      )}

      {loading && <ProcessStatus status={processStatus} />}

      {widgetListStore.widgetList.map((widget, index) => (
        <TwitterWidget
          value={widget.value}
          key={index}
          isOwner={domainStore.isOwner}
          onDelete={() => deleteWidget(widget.id)}
        />
      ))}

      {domainStore.domainRecord && domainStore.domainRecord.url && (
        <TwitterWidget
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
