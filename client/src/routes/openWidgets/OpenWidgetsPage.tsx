import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useStores } from '../../stores'
import {
  WidgetInputContainer,
  WidgetStyledInput,
} from '../../components/page-widgets/PageWidgets.styles'
import TwitterWidget from '../../components/widgets/TwitterWidget'
import { openWidgetsStore, Widget } from './OpenWidgetsStore'
import { Container } from '../home/Home.styles'

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

  useEffect(() => {
    openWidgetsStore.loadWidgetList()
  }, [])

  useEffect(() => {
    setWidgetList(openWidgetsStore.widgetList)
  }, [openWidgetsStore.widgetList])

  const enterHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      setAddingWidget(true)
      const value = event.currentTarget.value

      const widget = {
        type: 'twitter',
        value,
      }

      openWidgetsStore.createWidget(widget).then(() => {
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
    openWidgetsStore.deleteWidget(widgetId)
  }

  return (
    <Container>
      <div style={{ height: '2em' }} />
      <WidgetInputContainer>
        <WidgetStyledInput
          placeholder="Twitter handle or tweet link"
          name="widgetValue"
          value={formFields.widgetValue}
          required
          onChange={onChange}
          onKeyDown={enterHandler}
          disabled={addingWidget}
          valid
        />
      </WidgetInputContainer>
      {widgetList.length > 0 &&
        widgetList.map((widget) => (
          <TwitterWidget
            isOwner
            key={widget.id}
            value={widget.value}
            onDelete={() => deleteWidget(widget.id)}
          />
        ))}
    </Container>
  )
})
