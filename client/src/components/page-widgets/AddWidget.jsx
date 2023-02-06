import React, { useState } from 'react'
import { AiOutlinePlus } from 'react-icons/ai'
import { Button, Input } from '../Controls'
import { FlexRow, Row } from '../Layout'
import { AddWidgetContainter, AddWidgetForm, FloatingTextInput } from './PageWidgets.styles'

const defaultFormFields = {
  widgetValue: '',
}
const AddWidget = ({ list, setList }) => {
  const [addingWidget, setAddingWidget] = useState(false)
  const [formFields, setFormFields] = useState(defaultFormFields)

  const buttonHandler = () => {
    console.log('click')
    setAddingWidget(true)
  }

  const onChange = (event) => {
    const { name, value } = event.target
    setFormFields({ ...formFields, [name]: value })
  }

  const handleSubmit = (event) => {
    // const { value: paymentType } = document.activeElement
    event.preventDefault()
    setList([...list, { type: 'twitter', value: formFields.widgetValue }])
    setAddingWidget(false)
  }
  return (
    <AddWidgetContainter>
      {!addingWidget
        ? (
          <div className='addWidget'>
            <h3>Add new Widget</h3>
            <button className='add-button' onClick={buttonHandler}><AiOutlinePlus /></button>
          </div>)
        : (
          <form onSubmit={handleSubmit}>
            <AddWidgetForm>
              <span style={{ marginTop: '1em', marginBottom: '1.5em' }}>Please share your Twitter handle</span>
              <Row style={{ width: '100%', gap: 0, position: 'relative' }}>
                <Input name='widgetValue' required onChange={onChange} />
                <FloatingTextInput>Twitter Handler</FloatingTextInput>
              </Row>
              <FlexRow style={{ gap: 32 }}>
                <Button type='submit' value='one' style={{ marginTop: '1em' }} disabled={!addingWidget}>Add</Button>
                {/* <Button type='submit' value='usd' style={{ marginTop: '1em' }} disabled={pending}>Rent (USD)</Button> */}
              </FlexRow>
            </AddWidgetForm>
          </form>)}
    </AddWidgetContainter>
  )
}

export default AddWidget
