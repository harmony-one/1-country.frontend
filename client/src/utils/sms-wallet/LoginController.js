import URLSearchParams from '@ungap/url-search-params'
// import {v4 as uuidv4} from 'uuid'
// import { ethers } from 'ethers'
// import {LoginArgs, LoginInit, LoginVerify} from 'src/types/login'

export default class LoginController {
  // constructor ({ store, lookup, remove, generate, appName, messagePrefix }) {
  constructor ({ generate, appName, messagePrefix }) {
    this.appName = appName
    // this.store = store
    // this.lookup = lookup
    // this.remove = remove
    this.generate = generate
    this.messagePrefix = messagePrefix || ''
  }

  async initLogin ({ callbackUrl, callbackParams }) {
    const callback = LoginController.base64UrlEncode(
      `${callbackUrl}?${LoginController._getQueryStringFromObject(callbackParams)}`
    )
    const message = LoginController.urlEncode(await this.generate())
    const caller = LoginController.urlEncode(this.appName)

    return {
      callback,
      message,
      caller,
    }
  }

  // async verifyLogin ({ signature, messageHash, address, error, cancelled }) {
  //   if (error || cancelled) return false
  //   // 1. Verify this is a message we sent
  //   const originalMessage = await this.lookup(messageHash)
  //   if (!originalMessage) return false

  //   // 2. Only the address returned based on signature should matter,
  //   // but we'll check against address provided as sanity check
  //   const sigAddress = ethers.utils.verifyMessage(originalMessage, signature)
  //   if (sigAddress !== address) return false

  //   return true
  // }

  static _getQueryStringFromObject (obj) {
    if (!obj || Object.keys(obj).length === 0) return ''

    const params = new URLSearchParams()
    for (const k in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, k)) continue
      params.set(k, obj[k])
    }
    return params.toString()
  }

  static base64Encode (s) {
    return Buffer.from(s).toString('base64')
  }

  static urlEncode (s) {
    return encodeURIComponent(s)
  }

  static base64UrlEncode (s) {
    const b64 = LoginController.base64Encode(s)
    return LoginController.urlEncode(b64)
  }

  // static generateOneTimeCode () {
  //   return uuidv4()
  // }
}
