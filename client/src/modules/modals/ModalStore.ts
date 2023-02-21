import { ModalIds, ModalMap } from './types'
import { action, makeObservable, observable } from 'mobx'

export class ModalStore {
  constructor() {
    makeObservable(
      this,
      {
        _modalMap: observable,
        activeModalId: observable,
        addModal: action,
        removeModal: action,
        showModal: action,
        hideModal: action,
      },
      { autoBind: true }
    )
  }

  public _modalMap: ModalMap = {} as ModalMap
  public activeModalId: ModalIds

  public addModal<K extends ModalIds>(modalId: K, modalItem: ModalMap[K]) {
    this._modalMap[modalId] = modalItem
  }

  public showModal<K extends ModalIds>(modalId: K) {
    this.activeModalId = modalId
  }

  public hideModal() {
    this.activeModalId = null
  }

  public removeModal<K extends ModalIds>(modalId: K) {
    delete this._modalMap[modalId]
  }

  public getModal<K extends ModalIds>(modalId: K): ModalMap[K] {
    return this._modalMap[modalId]
  }
}
