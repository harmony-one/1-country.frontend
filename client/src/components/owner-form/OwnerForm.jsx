import React, { useEffect, useState } from 'react'
import { OwnerFormContainer } from './OwnerForm.styles' // FloatingTextInput
import {
  Button,
  // Input,
} from '../Controls'
import { FlexRow } from '../Layout' // Row }

const defaultFormFields = {
  telegram: '',
  email: '',
  phone: ''
}
const OwnerForm = ({ onAction, buttonLabel, pending }) => {
  const [formFields, setFormFields] = useState(defaultFormFields)

  // const onChange = (event) => {
  //   const { name, value } = event.target
  //   setFormFields({ ...formFields, [name]: value })
  // }

  useEffect(() => {
    setFormFields({
      telegram: 'telegramHandler',
      email: 'hello@harmony.one',
      phone: '+12815553321'
    })
  }, [])

  const handleSubmit = (event) => {
    // get payment type from Submit button
    const { value: paymentType } = document.activeElement
    event.preventDefault()
    console.log('formFields:', formFields)
    onAction({
      telegram: formFields.telegram,
      email: formFields.email,
      phone: formFields.phone,
      isRenewal: false,
      paymentType
    })
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <OwnerFormContainer>
          {/* <span style={{ marginTop: '1em', marginBottom: '1.5em' }}>Please fill the following information</span>
          <Row style={{ width: '100%', gap: 0, position: 'relative' }}>
            <Input name='telegram' required onChange={onChange} />
            <FloatingTextInput>Telegram Handle</FloatingTextInput>
          </Row>
          <Row style={{ width: '100%', gap: 0, position: 'relative' }}>
            <Input name='email' required onChange={onChange} type='email' />
            <FloatingTextInput>Email Address</FloatingTextInput>
          </Row>
          <Row style={{ width: '100%', gap: 0, position: 'relative' }}>
            <Input name='phone' required onChange={onChange} />
            <FloatingTextInput>Phone Number</FloatingTextInput>
          </Row> */}
          <FlexRow style={{ gap: 32 }}>
            <Button type='submit' value='one' style={{ marginTop: '1em' }} disabled={pending}>{buttonLabel}</Button>
            <Button type='submit' value='usd' style={{ marginTop: '1em' }} disabled={pending}>Rent (USD)</Button>
          </FlexRow>
        </OwnerFormContainer>
      </form>
    </>
  )
}

export default OwnerForm
