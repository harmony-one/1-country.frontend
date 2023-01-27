import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setWallet, setProvider, setIsHarmony } from '../../utils/store/walletSlice'
import { PROVIDER_TYPE } from '../../utils/sms-wallet/SmsWallet.utils'
import { Container } from '../home/Home.styles'
import { Main } from '../../components/Layout'
import { selectPageName } from '../../utils/store/pageSlice'

const Verify = () => {
  const [, setIsPending] = useState(true)
  const [message, setMessage] = useState('')
  const [redirectUri, setRedirectUri] = useState('')
  const history = useHistory()
  const dispatch = useDispatch()
  const pageName = useSelector(selectPageName)

  useEffect(() => {
    // Standard params
    const params = new URLSearchParams(window.location.search)
    const signature = params.get('signature')
    const address = params.get('address')
    const messageHash = params.get('messageHash')
    const error = params.get('error')
    const cancelled = params.get('cancelled')
    const redirect = params.get('redirect')
    const destinationPageName = params.get('destinationPageName')
    const destinationPageUrl = params.get('destinationPageUrl')
    console.log(error, cancelled, address)
    console.log(signature)
    console.log(messageHash)
    console.log(destinationPageUrl)
    console.log(destinationPageName)
    console.log(redirect)

    if (redirect) setRedirectUri(redirect)

    dispatch(setWallet(address))
    dispatch(setProvider(PROVIDER_TYPE.SMS_WALLET))
    dispatch(setIsHarmony(true))

    const doRedirect = (url) => {
      console.log('doredirect', url)
      history.push(url)
    }

    setMessage(
      `Your information has been verified. Redirecting to ${
        pageName} page in a few seconds.`
    )

    setTimeout(function () {
      doRedirect(
        destinationPageUrl || '/'
      )
    }, 3000)
  }, [setIsPending, setRedirectUri])

  return (
    <Container>
      <Main style={{ textAlign: 'center' }}>
        <div className='login-verify__header'>
          <h1 className='login-verify__title'>1.country</h1>
        </div>
        <div className='login-verify__body'>
          <h3>
            Verifying your credentials.
            <br /> Please wait...
          </h3>
          <br />
          <p>{message}</p>
          {redirectUri ? <a href={redirectUri}>Continue</a> : null}
        </div>
      </Main>
    </Container>
  )
}

export default Verify
