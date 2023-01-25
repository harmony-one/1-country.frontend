import React, { useEffect, useRef, useState } from 'react'
import { isPossiblePhoneNumber } from 'react-phone-number-input'

import PhoneNumberInput from '../../components/input/PhoneNumberInput'
import { smsLoginHandler } from '../../utils/sms-wallet/SmsWallet.utils'

import './Login.styles.scss'
// import FullLogo from '../../components/logo/logo.component'
// import { verifyLogin } from '../../utils/sms-wallet/comunicator'

const LoginPage = () => {
  const [mobileNumber, setMobileNumber] = useState(process.env.NODE_ENV !== 'production' ? '+573232378976' : '')
  const [connecting, setConnecting] = useState(false)

  const mobileNumberRef = useRef(mobileNumber)

  const loginHandler = async () => {
    try {
      setConnecting(true)
      await smsLoginHandler(mobileNumber)
    } catch (e) {
      console.log('Cannot login:', e)
    } finally {
      setConnecting(false)
    }
  }
  useEffect(() => {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        console.log('length', isPossiblePhoneNumber(mobileNumberRef.current))
        if (isPossiblePhoneNumber(mobileNumberRef.current)) {
          loginHandler()
        }
      }
    })
  })

  const onChangeHandler = (event) => {
    const { value } = event.target
    mobileNumberRef.current = value
    setMobileNumber(value)
  }

  const verifyPhone = () => {
    if (mobileNumber) {
      return isPossiblePhoneNumber(mobileNumber) && !connecting
    }
    return false
  }

  return (
    <div className='login'>
      {/* <div className='login__header'>
        <FullLogo />
      </div> */}
      <div className='login__body'>
        <div className='login__phone_input'>
          <PhoneNumberInput
            placeholder='Enter phone number*'
            name='phoneNumber'
            required
            defaultCountry='US'
            value={mobileNumber}
            onChange={(value) =>
              onChangeHandler({
                target: {
                  name: 'phoneNumber',
                  value,
                },
              })}
          />
        </div>

        <button onClick={loginHandler} disabled={!verifyPhone()}>
          Login
        </button>
      </div>
    </div>
  )
}

export default LoginPage
