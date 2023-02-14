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
    openWidgetsPageStore.loadWidgetList()
  }, [])

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
      {widgetList.length > 0 &&
        widgetList.map((widget, index) => (
          <TwitterWidget
            value={widget.value}
            key={widget.id}
            widgetKey={widget.id}
            deleteWidget={() => deleteWidget(widget.id)}
          />
        ))}
    </PageWidgetContainer>
  )
})
