import Web3 from 'web3'
import { action, makeObservable, observable } from 'mobx'
import config from '../../config'
import { modalStore } from '../modules/modals/ModalContext'
import { ModalStore } from '../modules/modals/ModalStore'
import { RatesStore } from './RatesStore'
import { WalletStore } from './WalletStore'
import { DomainStore } from './DomainStore'
import Constants from '../constants'
import dcApi, { D1DCClient } from '../api'
import {
  uiTransactionStore,
  UITransactionStore,
} from '../modules/transactions/UITransactionStore'
import { MetaTagsStore, metaTagsStore } from '../modules/metatags/MetaTagsStore'
import { wagmiClient } from '../modules/wagmi/wagmiClient'
import tweetApi, { TweetClient } from '../api/tweetApi'
import commonApi, { CommonClient } from '../api/common'

export class RootStore {
  modalStore: ModalStore
  ratesStore: RatesStore
  d1dcClient: D1DCClient
  tweetClient: TweetClient
  commonClient: CommonClient
  domainStore: DomainStore
  walletStore: WalletStore
  uiTransactionStore: UITransactionStore

  stores: {
    modalStore: ModalStore
    ratesStore: RatesStore
    domainStore: DomainStore
    walletStore: WalletStore
    uiTransactionStore: UITransactionStore
    metaTagsStore: MetaTagsStore
  }

  constructor() {
    makeObservable(
      this,
      {
        d1dcClient: observable,
        updateClients: action,
      },
      { autoBind: true }
    )

    const web3 = new Web3(config.defaultRPC)
    this.updateClients(web3, Constants.EmptyAddress)

    wagmiClient.autoConnect().then((result) => {
      console.log('### wagmi autoConnect')
      if (result) {
        const { account, provider } = result
        // @ts-ignore-error
        const web3 = new Web3(provider)
        this.updateClients(web3, account)
      }
    })

    this.modalStore = modalStore
    this.ratesStore = new RatesStore(this)
    this.walletStore = new WalletStore(this)
    this.domainStore = new DomainStore(this)
    this.uiTransactionStore = uiTransactionStore

    this.stores = {
      modalStore: this.modalStore,
      ratesStore: this.ratesStore,
      walletStore: this.walletStore,
      domainStore: this.domainStore,
      uiTransactionStore: this.uiTransactionStore,
      metaTagsStore: metaTagsStore,
    }
  }

  updateClients(web3: Web3, address: string) {
    console.log('### dc client updated', address)

    this.d1dcClient = dcApi({ web3, address })
    this.tweetClient = tweetApi({ web3, address })
    this.commonClient = commonApi(this.d1dcClient.contract, this.tweetClient.contract)
  }
}
