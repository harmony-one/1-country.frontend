import { RootStore } from './RootStore'
import { BaseStore } from './BaseStore'
import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import { getDomainName } from '../utils/getDomainName'
import { DCParams, DomainPrice, DomainRecord } from '../api'
import config from '../../config'

export class DomainStore extends BaseStore {
  public domainName: string = ''
  public domainPrice: DomainPrice | null = null
  public d1cParams: DCParams = {
    baseRentalPrice: {
      amount: '0',
      formatted: '0',
    },
    //@ts-ignore
    lastRented: '',
    duration: 0,
  }
  public domainRecord: DomainRecord | null = null

  constructor(rootStore: RootStore) {
    super(rootStore)

    makeObservable(
      this,
      {
        domainName: observable,
        domainRecord: observable,
        loadDomainRecord: action,
        isOwner: computed,
      },
      { autoBind: true }
    )

    this.domainName = getDomainName()

    this.getCommonClient()
      .getParameters()
      .then((d1cParams) => {
        this.d1cParams = d1cParams
      })
  }

  get isOwner() {
    if (
      !this.domainRecord ||
      !this.domainRecord.renter ||
      !this.stores.walletStore.isConnected
    ) {
      return false
    }

    return (
      this.domainRecord.renter.toLowerCase() ===
      this.stores.walletStore.walletAddress.toLowerCase()
    )
  }

  get isExpired() {
    if (!this.domainRecord) {
      return false
    }
    return this.domainRecord.expirationTime - Date.now() < 0
  }

  isGoingToExpire() {
    if (!this.domainRecord) {
      return false
    }
    const millisecondsInDay = 1000 * 60 * 60 * 24
    const remainderDays =
      Number(config.domain.expirationReminderDays) * millisecondsInDay
    console.log(
      'isGoing',
      this.domainRecord.expirationTime - Date.now() < remainderDays
    )
    return this.domainRecord.expirationTime - Date.now() < remainderDays
  }

  async loadDCParams() {
    try {
      this.d1cParams = await this.getCommonClient().getParameters()
    } catch (ex) {
      console.error('### ex load dc params', ex)
    }
  }

  async loadDomainRecord(domainName: string = getDomainName()) {
    if (!domainName) {
      return
    }

    try {
      const [domainRecord, domainPrice] = await Promise.all([
        this.getDCClient().getRecord({
          name: domainName,
        }),
        this.getDCClient().getPrice({
          name: domainName,
        }),
      ])

      runInAction(() => {
        this.domainPrice = domainPrice
        this.domainRecord = domainRecord
      })
    } catch (ex) {
      console.log('### error loadDomainRecord', ex)
    }
  }
}
