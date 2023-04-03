import { RootStore } from './RootStore'
import { BaseStore } from './BaseStore'
import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import { getDomainName } from '../utils/getDomainName'
import { DCParams, DomainPrice, DomainRecord } from '../api'
import { Domain, mainApi } from '../api/mainApi'
import { palette } from '../constants'
import logger from '../modules/logger'
import { ProcessStatusTypes } from '../components/process-status/ProcessStatus'

const log = logger.module('DomainStore')

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
  public domainExtendedInfo: Domain = null

  constructor(rootStore: RootStore) {
    super(rootStore)

    makeObservable(
      this,
      {
        domainName: observable,
        domainRecord: observable,
        loadDomainRecord: action,
        isOwner: computed,
        bgColor: computed,
        updateDomain: action,
        domainExtendedInfo: observable,
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

  get bgColor() {
    if (this.domainExtendedInfo && this.domainExtendedInfo.bgColor) {
      return this.domainExtendedInfo.bgColor
    }

    return palette.White
  }

  async loadDCParams() {
    try {
      this.d1cParams = await this.getCommonClient().getParameters()
    } catch (ex) {
      console.error('### ex load dc params', ex)
    }
  }

  async updateDomain(params: { domainName: string; bgColor: string }) {
    const { domainName, bgColor } = params

    const loaderId = 'UPDATE_DOMAIN'
    try {
      if (!this.stores.web2AuthStore.isAuthorized) {
        await this.stores.web2AuthStore.auth()
      }

      this.stores.loadersStore.setLoader(loaderId, {
        type: ProcessStatusTypes.PROGRESS,
        render: 'progress',
      })

      const result = await mainApi.updateDomain({
        domainName,
        bgColor,
        jwt: this.stores.web2AuthStore.jwt,
      })

      runInAction(() => {
        this.domainExtendedInfo = result
      })
      this.stores.loadersStore.setLoader(loaderId, {
        type: ProcessStatusTypes.SUCCESS,
        render: 'Success',
      })
    } catch (ex) {
      this.stores.loadersStore.setLoader(loaderId, {
        type: ProcessStatusTypes.ERROR,
        render: 'Error',
      })
      log.error('error: domain update', { error: ex })
    }
  }

  async loadDomainRecord(domainName: string = getDomainName()) {
    if (!domainName) {
      return
    }

    try {
      const [domainRecord, domainPrice, domainExtendedInfo] = await Promise.all(
        [
          this.getDCClient().getRecord({
            name: domainName,
          }),
          this.getDCClient().getPrice({
            name: domainName,
          }),
          mainApi.loadDomain({ domain: domainName }).catch(() => null),
        ]
      )

      runInAction(() => {
        this.domainPrice = domainPrice
        this.domainRecord = domainRecord
        this.domainExtendedInfo = domainExtendedInfo
      })
    } catch (ex) {
      console.log('### error loadDomainRecord', ex)
    }
  }
}
