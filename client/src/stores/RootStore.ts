import { makeObservable } from 'mobx'
import { modalStore } from '../modules/modals/ModalContext'
import { ModalStore } from '../modules/modals/ModalStore'
import { RatesStore } from './RatesStore'

export class RootStore {
  modalStore: ModalStore
  ratesStore: RatesStore

  constructor() {
    makeObservable(this, {}, { autoBind: true })

    this.modalStore = modalStore
    this.ratesStore = new RatesStore(this)
  }
}
