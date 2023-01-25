import React from 'react'
import PhoneInput from 'react-phone-number-input'

import 'react-phone-number-input/style.css'

import './input.styles.scss'

const PhoneNumberInput = (props) => {
  const { name, defaultCountry, value, ...otherProps } = props
  return (
    <div className='phone-number-input-container'>
      <PhoneInput name={name} id={name} defaultCountry={defaultCountry} value={value} {...otherProps} />
    </div>
  )
}

export default PhoneNumberInput
