import { RootStore } from './RootStore'
import { BaseStore } from './BaseStore'
import { action, computed, makeObservable, observable } from 'mobx'
import { getDomainName } from '../utils/getDomainName'
import { DCParams, DomainPrice, DomainRecord } from '../api'

export class DomainStore extends BaseStore {
  public domainName: string = ''
  public domainPrice: DomainPrice | null = null
  public d1cParams: DCParams = {
    baseRentalPrice: {
      amount: '0',
      formatted: '0',
    },
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
  }

  get isOwner() {
    if (
      !this.domainRecord ||
      !this.domainRecord.renter ||
      !this.rootStore.walletStore.isConnected
    ) {
      return false
    }

    return (
      this.domainRecord.renter.toLowerCase() ===
      this.rootStore.walletStore.walletAddress.toLowerCase()
    )
  }

  get isExpired() {
    if (!this.domainRecord) {
      return false
    }

    return this.domainRecord.expirationTime - Date.now() < 0
  }

  async loadDomainRecord(domainName: string = getDomainName()) {
    try {
      const [d1cParams, domainRecord, domainPrice] = await Promise.all([
        this.rootStore.d1dcClient.getParameters(),
        this.rootStore.d1dcClient.getRecord({
          name: domainName,
        }),
        this.rootStore.d1dcClient.getPrice({
          name: domainName,
        }),
      ])

      this.domainPrice = domainPrice
      this.domainRecord = domainRecord
      this.d1cParams = d1cParams
    } catch (ex) {
      console.log('### error', ex)
    }
  }
}
