
import LoginController from './LoginController'
import config from '../../../config'

const getController = (phone) => {
  return new LoginController({
    appName: '1.country',
    generate: async () => {
      const msg = `${phone} ${
        Math.floor(Date.now() / config.smsWallet.defaultSignatureValidDuration) *
        config.smsWallet.defaultSignatureValidDuration
      }`
      return msg
    },
  })
}

export const initLogin = async (args) => {
  const { phone, redirect } = args
  const callbackUrl = config.smsWallet.callbackVerify
  console.log('initLogin', redirect)
  console.log('initLogin', callbackUrl)
  try {
    const controller = getController(phone)
    const result = await controller.initLogin({
      callbackUrl: redirect || callbackUrl,
    })
    return result
    //  res.json(result)
  } catch (err) {
    console.error(err)
  }
}
