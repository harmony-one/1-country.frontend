import { initLogin } from './ComunicatorV2'

import { saveLocalState } from '../storage/LocalStorage.utils'

const BASE_URL = process.env.REACT_APP_BASE_URL
const SMS_URL = process.env.REACT_APP_SMS_WALLET_URL

console.log(BASE_URL, SMS_URL)

export const smsLoginHandler = async (mobileNumber, destinationPageName, destinationPageUrl) => {
  console.log('click', mobileNumber)
  const sign = await initLogin({
    phone: mobileNumber,
    redirect: destinationPageName && destinationPageUrl
      ? `${BASE_URL}/verify?destinationPageName=${destinationPageName}&destinationPageUrl=${destinationPageUrl}&other=other`
      : `${BASE_URL}/verify`
  })

  console.log('sign', sign)

  saveLocalState(mobileNumber)

  const params = `callback=${sign.callback}&message=${sign.message}&caller=${sign.caller}`
  console.log('URL', `${SMS_URL}/sign?${params}`)
  window.location.href = `${SMS_URL}/sign?${params}`
}
