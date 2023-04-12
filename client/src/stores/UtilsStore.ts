import cookie from 'js-cookie'
import { RootStore } from './RootStore'
import { BaseStore } from './BaseStore'
import { COOKIES } from '../constants'
import { nameUtils } from '../api/utils'
import { makeObservable, observable } from 'mobx'

export class UtilsStore extends BaseStore {
  post: string

  constructor(rootStore: RootStore) {
    super(rootStore)

    makeObservable(this, {
      post: observable,
    })
  }

  saveReferral(referral: string) {
    if (nameUtils.isValidName(referral)) {
      cookie.set(COOKIES.REFERRAL, referral, { expires: 365 })
    }
  }

  getReferral(): string {
    return cookie.get(COOKIES.REFERRAL) || ''
  }
}
