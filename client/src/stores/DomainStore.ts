import { RootStore } from './RootStore'
import { BaseStore } from './BaseStore'
import { action, computed, makeObservable, observable } from 'mobx'
import { getDomainName } from '../utils/getDomainName'
import { DomainRecord } from '../api'

export class DomainStore extends BaseStore {
  public domainName: string = ''
  public domainPrice: unknown
  public domainParams: unknown
  public domainRecord: DomainRecord | null = null

  constructor(rootStore: RootStore) {
    super(rootStore)

    this.domainName = getDomainName()

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
  }

  get isOwner() {
    if (!this.domainRecord) {
      return false
    }

    return this.domainRecord.renter === this.rootStore.walletStore.walletAddress
  }

  async loadDomainRecord() {
    this.domainRecord = await this.rootStore.d1dcClient.getRecord({
      name: this.domainName,
    })

    this.domainPrice = await this.rootStore.d1dcClient.getPrice({
      name: this.domainName,
    })

    this.domainParams = await this.rootStore.d1dcClient.getParameters()
  }
}
