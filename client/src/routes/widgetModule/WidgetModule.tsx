import React, { useEffect, useRef, useState } from 'react'
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
import { widgetListStore, Widget } from './WidgetListStore'
import { BaseText } from '../../components/Text'
import { TransactionWidget } from '../../components/widgets/TransactionWidget'
import { Transaction } from '../../api'
import { toast } from 'react-toastify'
import { FlexRow } from '../../components/Layout'
import { LinkWrarpper } from '../../components/Controls'
import isUrl from 'is-url'
import { MetamaskWidget } from '../../components/widgets/MetamaskWidget'
import MediaWidget from '../../components/widgets/MediaWidget'

const defaultFormFields = {
  widgetValue: '',
}

interface Props {
  domainName: string
}

export const WidgetModule: React.FC<Props> = observer(({ domainName }) => {
  const { domainStore, walletStore } = useStores()

  const toastId = useRef(null)

  useEffect(() => {
    domainStore.loadDomainRecord(domainName)
  }, [])

  useEffect(() => {
    widgetListStore.loadWidgetList(domainName)
    widgetListStore.loadDomainTx(domainName)
  }, [domainName])

  const [addingWidget, setAddingWidget] = useState(false)
  const [formFields, setFormFields] = useState(defaultFormFields)
  const [placeHolder, setPlaceHolder] = useState('')

  useEffect(() => {
    setPlaceHolder('Twitter handle or tweet link')
  }, [])

  const onSuccess = (tx: Transaction) => {
    const { transactionHash } = tx
    toast.update(toastId.current, {
      render: (
        <FlexRow>
          <BaseText style={{ marginRight: 8 }}>Done!</BaseText>
          <LinkWrarpper
            target="_blank"
            href={rootStore.d1dcClient.getExplorerUri(transactionHash)}
          >
            <BaseText>View transaction</BaseText>
          </LinkWrarpper>
        </FlexRow>
      ),
      type: 'success',
      isLoading: false,
      autoClose: 2000,
    })
  }
  const onFailed = (ex: Error) => {
    toast.update(toastId.current, {
      render: `Failed ${ex.message}`,
      type: 'error',
      isLoading: false,
      autoClose: 10000,
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

    setAddingWidget(true)
    toastId.current = toast.loading('Processing transaction')

    const tweet = parseInputValue(event.currentTarget.value)

    if (tweet.error) {
      toast.update(toastId.current, {
        render: tweet.error,
        type: 'error',
        isLoading: false,
        autoClose: 2000,
      })
      setAddingWidget(false)
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
      .createWidget({ widget, domainName, onSuccess, onFailed })
      .then(() => {
        setAddingWidget(false)
        setFormFields({ ...formFields, widgetValue: '' })
      })
  }

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormFields({ ...formFields, [name]: value })
  }

  const deleteWidget = (widgetId: number) => {
    toastId.current = toast.loading('Processing transaction')
    widgetListStore.deleteWidget({
      domainName,
      widgetId,
      onSuccess,
      onFailed,
    })
  }

  const handleDeleteLegacyUrl = async () => {
    toastId.current = toast.loading('Processing transaction')

    if (!walletStore.isConnected) {
      await walletStore.connect()
    }

    await rootStore.d1dcClient.updateURL({
      name: domainName,
      url: '',
      onSuccess,
      onFailed,
    })

    domainStore.loadDomainRecord(domainName)
  }

  const showInput = walletStore.isConnected && domainStore.isOwner

  return (
    <PageWidgetContainer>
      {showInput && (
        <WidgetInputContainer>
          <WidgetStyledInput
            placeholder={placeHolder}
            name="widgetValue"
            value={formFields.widgetValue}
            required
            onChange={onChange}
            onKeyDown={enterHandler}
            disabled={addingWidget}
            autoFocus
            valid // ={isValid && isAvailable}
          />
        </WidgetInputContainer>
      )}

      {/* {showAddButton && <AddWidget list={widgetList} setList={setWidgetList} isOwner={isOwner} />} */}
      {widgetListStore.widgetList.map((widget, index) => (
        <MediaWidget 
          isOwner={domainStore.isOwner}
          // key={widget.id}
          key={index}
          value={widget.value}
          onDelete={() => deleteWidget(widget.id)}
        />
        // <TwitterWidget
        //   value={widget.value}
        //   key={index}
        //   isOwner={domainStore.isOwner}
        //   onDelete={() => deleteWidget(widget.id)}
        // />
      ))}

      {domainStore.domainRecord && domainStore.domainRecord.url && (
        <MediaWidget 
          value={domainStore.domainRecord.url}
          isOwner={domainStore.isOwner}
          onDelete={handleDeleteLegacyUrl}
        />
        // <TwitterWidget
        //   value={domainStore.domainRecord.url}
        //   isOwner={domainStore.isOwner}
        //   onDelete={handleDeleteLegacyUrl}
        // />
      )}

      {domainStore.domainRecord && (
        <TransactionWidget
          name={domainStore.domainName}
          loading={widgetListStore.txDomainLoading}
          domainRecord={domainStore.domainRecord}
          txHash={widgetListStore.txDomain}
        />
      )}
      {!walletStore.isConnected && <MetamaskWidget />}
    </PageWidgetContainer>
  )
})
