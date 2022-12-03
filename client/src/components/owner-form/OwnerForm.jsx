import React, { useState } from 'react'
import { OwnerFormContainer, FloatingTextInput } from './OwnerForm.module'
import {
  Button,
  Input,
} from '../../components/Controls'
import { Row } from '../../components/Layout'

const defaultFormFields = {
  telegram: '',
  email: '',
  phone: ''
}
const OwnerForm = ({ onAction, buttonLabel }) => {
  const [formFields, setFormFields] = useState(defaultFormFields)

  const onChange = (event) => {
    const { name, value } = event.target
    setFormFields({ ...formFields, [name]: value })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onAction()
  }

  console.log(formFields)

  return (
    <>
      <form onSubmit={handleSubmit}>
        <OwnerFormContainer>
          <span style={{ marginTop: '1em', marginBottom: '1.5em' }}>Please fill the following information</span>
          <Row style={{ width: '100%', gap: 0, position: 'relative' }}>
            <Input name='telegram' required={false} onChange={onChange} />
            <FloatingTextInput>Telegram Handler</FloatingTextInput>
          </Row>
          <Row style={{ width: '100%', gap: 0, position: 'relative' }}>
            <Input name='email' required={false} onChange={onChange} />
            <FloatingTextInput>Email Address</FloatingTextInput>
          </Row>
          <Row style={{ width: '100%', gap: 0, position: 'relative' }}>
            <Input name='phone' required={false} onChange={onChange} />
            <FloatingTextInput>Phone Number</FloatingTextInput>
          </Row>
          <Button type='submit' style={{ marginTop: '1em' }}>{buttonLabel}</Button>
        </OwnerFormContainer>
      </form>
    </>
  )
}

export default OwnerForm
