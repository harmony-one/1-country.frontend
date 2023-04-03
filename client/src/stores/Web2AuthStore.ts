import cookie from 'js-cookie'
import { BaseStore } from './BaseStore'
import { RootStore } from './RootStore'
import { mainApi } from '../api/mainApi'
import { COOKIES } from '../constants'
import { action, computed, makeObservable, observable } from 'mobx'

export class Web2AuthStore extends BaseStore {
  jwt: string

  constructor(rootStore: RootStore) {
    super(rootStore)

    makeObservable(
      this,
      {
        restoreAuth: action,
        auth: action,
        jwt: observable,
        isAuthorized: computed,
      },
      { autoBind: true }
    )

    this.restoreAuth()
  }

  get isAuthorized() {
    return !!this.jwt
  }

  async restoreAuth() {
    const jwt = cookie.get(COOKIES.JWT) || null

    if (!jwt) {
      cookie.remove(COOKIES.JWT)
      return false
    }

    const result = await mainApi.checkJWT(jwt)

    if (!result) {
      cookie.remove(COOKIES.JWT)
      return false
    }

    this.jwt = jwt
    // this.address = jwtDecode<{ address: string }>(jwt).address
    // this.registerProvider()
    return true
  }

  async auth() {
    if (!this.stores.walletStore.isConnected) {
      return
    }

    const address = this.stores.walletStore.walletAddress

    const { message } = await mainApi.requestNonce({ address })

    const signature = await this.getDCClient().web3.eth.personal.sign(
      message,
      address,
      ''
    )

    const result = await mainApi.auth({ signature, address: address })

    this.jwt = result.token
    cookie.set(COOKIES.JWT, result.token, { expires: 30 })
  }
}
