import React, {useEffect, useState} from 'react'
import {TransactionReceipt} from 'web3-core'
import {rootStore, useStores} from '../../stores'
import {PageWidgetContainer, WidgetInputContainer,} from '../../components/page-widgets/PageWidgets.styles'
import {observer} from 'mobx-react-lite'
import {Widget, widgetListStore} from './WidgetListStore'
import {TransactionWidget} from '../../components/widgets/TransactionWidget'
import isValidUrl from 'is-url'
import {MetamaskWidget} from '../../components/widgets/MetamaskWidget'
import {WalletConnectWidget} from '../../components/widgets/WalletConnectWidget'
import {ProcessStatus, ProcessStatusItem, ProcessStatusTypes,} from '../../components/process-status/ProcessStatus'
import {sleep} from '../../utils/sleep'
import {SearchInput} from '../../components/search-input/SearchInput'
import {MediaWidget} from '../../components/widgets/MediaWidget'
import {loadEmbedJson} from '../../modules/embedly/embedly'
import {isValidInstagramUri, isValidTwitUri} from '../../utils/validation'
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

  const terminateProcess = async (timer: number = 5000) => {
    await sleep(timer)
    setLoading(false)
    setProcessStatus({ type: ProcessStatusTypes.IDLE, render: '' })
  }

  const onSuccess = (message: string) => (tx: TransactionReceipt) => {
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

    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: ''
    })

    try {
      setLoading(true)
      let errorMessage = ''
      const isUrl = isValidUrl(value)
      const isTwit = isValidTwitUri(value)
      const isInst = isValidInstagramUri(value)

      if(!isUrl) {
        errorMessage = 'Invalid URL'
      } else if(!isTwit && !isInst) {
        errorMessage = 'Invalid URL. Please enter valid twitter or instagram link.'
      } else {
        const embedData = await loadEmbedJson(value)
        if (!embedData) {
          errorMessage = `Sorry, we can't embed this URL`
        }
      }

      if(errorMessage) {
        throw new Error(errorMessage)
      }

      const widget: Widget = {
        type: 'url',
        value: value,
      }

      await widgetListStore
        .createWidget({
          widget,
          domainName,
          onSuccess: onSuccess('Url successfully added'),
          onFailed: onFailed(),
        })
      setFormFields({ ...formFields, widgetValue: '' })
      terminateProcess()
    } catch (e) {
      console.error('Embed error: ', e)
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: e.message || 'Unknown error, try again later',
      })
    } finally {
      setLoading(false)
    }
  }

  const onChange = (value: string) => {
    setFormFields({ ...formFields, widgetValue: value })
    if(!value) {
      terminateProcess(0)
    }
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
        onSuccess: onSuccess('Post deleted'),
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
            disabled={isLoading}
            isValid={processStatus.type !== ProcessStatusTypes.ERROR}
            placeholder={'Enter tweet or instagram post link'}
            value={formFields.widgetValue}
            onSearch={onChange}
            onKeyDown={enterHandler}
          />

          {processStatus.type !== ProcessStatusTypes.IDLE &&
            <Box align={'center'} style={{ position: 'relative' }}>
              <Box margin={{ top: processStatus.type === ProcessStatusTypes.ERROR ? '4px' : '8px' }} style={{ position: 'absolute' }}>
                <ProcessStatus status={processStatus} />
              </Box>
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
