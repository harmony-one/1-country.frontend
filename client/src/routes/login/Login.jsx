import React, { useEffect, useRef, useState } from 'react'
import { isPossiblePhoneNumber } from 'react-phone-number-input'
import { useSelector } from 'react-redux'
import PhoneNumberInput from '../../components/input/PhoneNumberInput'
import { smsLoginHandler } from '../../utils/sms-wallet/SmsWallet.utils'
import { selectPageName } from '../../utils/store/pageSlice'

import './Login.styles.scss'
// import FullLogo from '../../components/logo/logo.component'
// import { verifyLogin } from '../../utils/sms-wallet/comunicator'

const LoginPage = () => {
  const [mobileNumber, setMobileNumber] = useState(process.env.NODE_ENV !== 'production' ? '+573232378976' : '')
  const [connecting, setConnecting] = useState(false)
  const pageName = useSelector(selectPageName)
  const mobileNumberRef = useRef(mobileNumber)
  console.log(pageName)
  const loginHandler = async () => {
    try {
      setConnecting(true)
      await smsLoginHandler(pageName, mobileNumber)
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
      <div className='login__title'>
        SMS Wallet
      </div>
      <div className='login__subtitle'>
        Please register your phone number to login/sign up
      </div>
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
