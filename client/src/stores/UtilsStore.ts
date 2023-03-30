import cookie from 'js-cookie'
import { RootStore } from './RootStore'
import { BaseStore } from './BaseStore'
import { COOKIES } from '../constants'

export class UtilsStore extends BaseStore {
  constructor(rootStore: RootStore) {
    super(rootStore)
  }

  saveReferral(referral: string) {
    cookie.set(COOKIES.REFERRAL, referral)
  }

  getReferral(): string {
    return cookie.get(COOKIES.REFERRAL) || ''
  }
}
