import React, { useEffect, useState } from 'react'
import { useStores } from '../../stores'
import {
  PageWidgetContainer,
  WidgetInputContainer,
  WidgetStyledInput,
} from '../../components/page-widgets/PageWidgets.styles'
import TwitterWidget from '../../components/widgets/TwitterWidget'
import { observer } from 'mobx-react-lite'
import { openWidgetsPageStore, Widget } from './OpenWidgetsPageStore'
import { GradientText } from '../../components/Text'
import { TransactionWidget } from '../../components/widgets/TransactionWidget'

const defaultFormFields = {
  widgetValue: '',
}

export const OpenWidgetsPage = observer(() => {
  const { domainStore } = useStores()

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

  const enterHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      setAddingWidget(true)
      const value = event.currentTarget.value

      const widget = {
        type: 'twitter',
        value,
      }

      openWidgetsPageStore.createWidget(widget).then(() => {
        setAddingWidget(false)
        setFormFields({ ...formFields, widgetValue: '' })
      })
    }
  }

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormFields({ ...formFields, [name]: value })
  }

  const deleteWidget = (widgetId: string) => {
    openWidgetsPageStore.deleteWidget(widgetId)
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
            key={widget.id}
            type={1}
            // widgetKey={widget.id}
            deleteWidget={() => deleteWidget(widget.id)}
          />
        ))}
    </PageWidgetContainer>
  )
})
