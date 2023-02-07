import React, { useEffect, useState } from 'react'
import { InputContainer, StyledInput } from '../SearchBlock'
import TwitterWidget from '../widgets/TwitterWidget'
import { PageWidgetContainer } from './PageWidgets.styles'

const defaultFormFields = {
  widgetValue: '',
}

const PageWidgets = ({ isOwner, showAddButton }) => {
  const [widgetList, setWidgetList] = useState([])
  const [addingWidget, setAddingWidget] = useState(false)
  const [formFields, setFormFields] = useState(defaultFormFields)
  const [placeHolder, setPlaceHolder] = useState('')

  useEffect(() => {
    setPlaceHolder('Twitter name or tweet link')
  }, [])
  const enterHandler = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      setAddingWidget(true)
      const value = event.target.value
      if (value.length > 0) {
        console.log('enter pressed', event.target.value)
        widgetList.unshift({
          type: '',
          value: event.target.value
        })
        setWidgetList([...widgetList])
        setAddingWidget(false)
        setFormFields({ ...formFields, widgetValue: '' })
      }
    }
  }

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
        <InputContainer>
          <StyledInput
            placeholder={placeHolder}
            name='widgetValue'
            value={formFields.widgetValue}
            required
            onChange={onChange}
            onKeyDown={enterHandler}
            disabled={addingWidget}
          />
        </InputContainer>}
      {/* {showAddButton && <AddWidget list={widgetList} setList={setWidgetList} isOwner={isOwner} />} */}
      {widgetList.length > 0 && (
        widgetList.map((widget, index) =>
          <TwitterWidget value={widget.value} clave={index} key={index} widgetKey={index} deleteWidget={deleteWidget} />)
      )}
    </PageWidgetContainer>
  )
}

export default PageWidgets
