import { RootStore } from './RootStore'
import { BaseStore } from './BaseStore'
import { action, computed, makeObservable, observable } from 'mobx'
import { getDomainName } from '../utils/getDomainName'
import { DCParams, DomainPrice, DomainRecord } from '../api'

export class DomainStore extends BaseStore {
  public domainName: string = ''
  public domainPrice: DomainPrice | null = null
  public domainParams: DCParams | null = null
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
    if (!this.domainRecord) {
      return false
    }

    return this.domainRecord.renter === this.rootStore.walletStore.walletAddress
  }

  async loadDomainRecord() {
    if (!this.domainName) {
      return
    }

    try {
      this.domainRecord = await this.rootStore.d1dcClient.getRecord({
        name: this.domainName,
      })
      this.domainPrice = await this.rootStore.d1dcClient.getPrice({
        name: this.domainName,
      })

      this.domainParams = await this.rootStore.d1dcClient.getParameters()
    } catch (ex) {
      console.log('### error', ex)
    }
  }
}
