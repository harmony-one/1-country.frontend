
import LoginController from './LoginController'
import config from '../../../config'

const getController = (phone) => {
  return new LoginController({
    appName: '1.country',
    // store,
    // lookup: async (k: string): Promise<string> => {
    //   const u = await conn.getUserByUUID(user.uuid)
    //   return u.pendingCode
    // },
    // remove: async (k: string): Promise<string> => {
    //   const code = user.pendingCode
    //   user.pendingCode = ''
    //   user.codeHash = ''
    //   await conn.updateUser(user)

    //   return user.pendingCode
    // },
    generate: async () => {
      const msg = `${phone} ${
        Math.floor(Date.now() / config.smsWallet.defaultSignatureValidDuration) *
        config.smsWallet.defaultSignatureValidDuration
      }`
      // web3 accounts that SMS wallet uses envelopes the message. We'll need to modify it to match.
      // const envelopeMsg = '\x19Ethereum Signed Message:\n' + msg.length + msg
      // const msgHash = Web3.utils.soliditySha3(envelopeMsg)
      // await store(msgHash!, msg)
      return msg
    },
  })
}

export const initLogin = async (phone, redirectPostLogin) => {
  const callbackUrl = config.smsWallet.callbackVerify
  // const redirectPostLogin = req.body.redirect
  // const phone = req.body.phone

  // todo: if the user is logged in and already has an account; we should
  // reject this request? or should we update the users' wallet address?

  try {
    const controller = getController(phone)
    const result = await controller.initLogin({
      callbackUrl: redirectPostLogin || callbackUrl,
    })
    console.log('RESULT FCO', result)
    return result
    //  res.json(result)
  } catch (err) {
    console.error(err)
  }
}
