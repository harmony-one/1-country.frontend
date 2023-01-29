import { initLogin } from './ComunicatorV2'
import config from '../../../config'
import { saveLocalState } from '../storage/LocalStorage.utils'

const SMS_URL = process.env.REACT_APP_SMS_WALLET_URL

export const PROVIDER_TYPE = {
  NONE: 0,
  WALLET_CONNECT: 1,
  SMS_WALLET: 2
}

export const smsLoginHandler = async (pageName, mobileNumber, destinationPageName, destinationPageUrl) => {
  console.log('click', mobileNumber)
  const tld = config.tld
  const baseUrl = `https://${pageName}${tld}`
  console.log('smsLoginHandler', baseUrl)
  const sign = await initLogin({
    phone: mobileNumber,
    redirect: destinationPageName && destinationPageUrl
      ? `${baseUrl}/verify?destinationPageName=${destinationPageName}&destinationPageUrl=${destinationPageUrl}&other=other`
      : `${baseUrl}/verify`
  })

  console.log('sign', sign)

  saveLocalState(mobileNumber)

  const params = `callback=${sign.callback}&message=${sign.message}&caller=${sign.caller}`
  console.log('URL', `${SMS_URL}/sign?${params}`)
  window.location.href = `${SMS_URL}/sign?${params}`
}
