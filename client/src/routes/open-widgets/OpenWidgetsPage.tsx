import React, { useEffect, useRef, useState } from 'react'
import { rootStore, useStores } from '../../stores'
import {
  PageWidgetContainer,
  WidgetInputContainer,
  WidgetStyledInput,
} from '../../components/page-widgets/PageWidgets.styles'
import TwitterWidget from '../../components/widgets/TwitterWidget'
import { observer } from 'mobx-react-lite'
import { openWidgetsPageStore, Widget } from './OpenWidgetsPageStore'
import { BaseText, GradientText } from '../../components/Text'
import { TransactionWidget } from '../../components/widgets/TransactionWidget'
import { Transaction } from '../../api'
import { toast } from 'react-toastify'
import { FlexRow } from '../../components/Layout'
import { LinkWrarpper } from '../../components/Controls'

const defaultFormFields = {
  widgetValue: '',
}

export const OpenWidgetsPage = observer(() => {
  const { domainStore } = useStores()

  const domainName = domainStore.domainName

  const toastId = useRef(null)

  useEffect(() => {
    domainStore.loadDomainRecord()
  }, [])

  const [widgetList, setWidgetList] = useState<Widget[]>([])
  const [addingWidget, setAddingWidget] = useState(false)
  const [formFields, setFormFields] = useState(defaultFormFields)
  const [placeHolder, setPlaceHolder] = useState('')

  useEffect(() => {
    openWidgetsPageStore.loadWidgetList(domainStore.domainName)
    openWidgetsPageStore.loadDomainTx(domainStore.domainName)
  }, [domainStore.domainName])

  useEffect(() => {
    setWidgetList(openWidgetsPageStore.widgetList)
  }, [openWidgetsPageStore.widgetList])

  useEffect(() => {
    setPlaceHolder('twitter handle or tweet link')
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
  const onFailed = () => {
    toast.update(toastId.current, {
      render: 'Failed',
      type: 'error',
      isLoading: false,
      autoClose: 2000,
    })
  }

  const enterHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()
    setAddingWidget(true)
    const value = event.currentTarget.value

    const widget: Widget = {
      type: 'twitter',
      value,
    }

    toastId.current = toast.loading('Processing transaction')

    openWidgetsPageStore
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
    console.log('### domainName', domainName)
    console.log('### widgetId', widgetId)
    toastId.current = toast.loading('Processing transaction')
    openWidgetsPageStore.deleteWidget({
      domainName,
      widgetId,
      onSuccess,
      onFailed,
    })
  }

  const showAddButton = true

  return (
    <PageWidgetContainer>
      <div style={{ height: '2em' }} />
      <GradientText>{domainStore.domainName}.country</GradientText>

      <div style={{ height: '1em' }} />
      {showAddButton && (
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

      {domainStore.domainRecord && (
        <TransactionWidget
          name={domainStore.domainName}
          loading={openWidgetsPageStore.txDomainLoading}
          domainRecord={domainStore.domainRecord}
          txHash={openWidgetsPageStore.txDomain}
        />
      )}
      <div style={{ height: '2em' }} />

      {widgetList.length > 0 &&
        widgetList.map((widget, index) => (
          <TwitterWidget
            value={widget.value}
            key={index}
            type={1}
            // widgetKey={widget.id}
            deleteWidget={() => deleteWidget(widget.id)}
          />
        ))}
    </PageWidgetContainer>
  )
})
