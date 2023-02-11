import React, { useEffect, useState } from 'react'
import TwitterWidget from '../widgets/TwitterWidget'
import { PageWidgetContainer, WidgetInputContainer, WidgetStyledInput } from './PageWidgets.styles'

const defaultFormFields = {
  widgetValue: '',
}

const PageWidgets = ({ isOwner, showAddButton }) => {
  const [widgetList, setWidgetList] = useState([])
  const [addingWidget, setAddingWidget] = useState(false)
  const [formFields, setFormFields] = useState(defaultFormFields)
  const [placeHolder, setPlaceHolder] = useState('')

  useEffect(() => {
    setPlaceHolder('twitter handle or tweet link')
  }, [])

  const enterHandler = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      setAddingWidget(true)
      const value = event.target.value
      if (value === '1' || value === 's') {
        setWidgetList([{
          type: '',
          value: 'http://twitter.com/stse/status/1477342465774342145'
        }, ...widgetList])
        setAddingWidget(false)
        setFormFields({ ...formFields, widgetValue: '' })
        return
      }
      if (value.length > 0) {
        if (!widgetList.find(e => e.value === value)) {
          setWidgetList([{
            type: '',
            value: event.target.value
          }, ...widgetList])
        }
        setAddingWidget(false)
        setFormFields({ ...formFields, widgetValue: '' })
      } else {
        setAddingWidget(false)
      }
    }
  }
  console.log(widgetList)
  const onChange = (event) => {
    const { name, value } = event.target
    setFormFields({ ...formFields, [name]: value })
  }

  const deleteWidget = (value) => {
    const newWidgetList = widgetList.filter(w => w.value !== value)
    setWidgetList(newWidgetList)
  }

  return (
    <PageWidgetContainer>
      {showAddButton &&
        <WidgetInputContainer>
          <WidgetStyledInput
            placeholder={placeHolder}
            name='widgetValue'
            value={formFields.widgetValue}
            required
            onChange={onChange}
            onKeyDown={enterHandler}
            disabled={addingWidget}
            valid // ={isValid && isAvailable}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
        </WidgetInputContainer>}
      {widgetList.map((widget, index) =>
        <TwitterWidget 
          value={widget.value} 
          key={widget.value} 
          widgetKey={index} 
          deleteWidget={deleteWidget} />)}
    </PageWidgetContainer>
  )
}

export default PageWidgets
