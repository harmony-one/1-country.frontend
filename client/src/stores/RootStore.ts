import Web3 from 'web3'
import { action, makeObservable, observable } from 'mobx'
import config from '../../config'
import { modalStore } from '../modules/modals/ModalContext'
import { ModalStore } from '../modules/modals/ModalStore'
import { RatesStore } from './RatesStore'
import { WalletStore } from './WalletStore'
import { DomainStore } from './DomainStore'
import Constants from '../constants'
import apis, { D1DCClient } from '../api'
import {
  uiTransactionStore,
  UITransactionStore,
} from '../modules/transactions/UITransactionStore'

export class RootStore {
  modalStore: ModalStore
  ratesStore: RatesStore
  d1dcClient: D1DCClient
  domainStore: DomainStore
  walletStore: WalletStore
  uiTransactionStore: UITransactionStore

  stores: {
    modalStore: ModalStore
    ratesStore: RatesStore
    domainStore: DomainStore
    walletStore: WalletStore
    uiTransactionStore: UITransactionStore
  }

  constructor() {
    makeObservable(
      this,
      {
        d1dcClient: observable,
        updateD1DCClient: action,
      },
      { autoBind: true }
    )

    const web3 = new Web3(config.defaultRPC)
    this.updateD1DCClient(web3, Constants.EmptyAddress)

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
    }
  }

  updateD1DCClient(web3: Web3, address: string) {
    console.log('### dc client updated', address)

    this.d1dcClient = apis({ web3, address })
  }
}
