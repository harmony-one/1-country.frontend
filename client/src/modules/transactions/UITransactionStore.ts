import { action, computed, makeObservable, observable } from 'mobx'
import { UITransaction, UITransactionConfig } from './UITransaction'

export class UITransactionStore {
  map: Record<string, UITransaction>
  activeId: string | null

  constructor() {
    makeObservable(
      this,
      {
        map: observable,
        activeId: observable,
        activeTx: computed,
        create: action,
        show: action,
        hide: action,
      },
      { autoBind: true }
    )

    this.map = {}
  }

  create(config: UITransactionConfig = {}) {
    const tx = new UITransaction(config)
    this.map[tx.id] = tx
    return tx
  }

  get activeTx() {
    return this.map[this.activeId]
  }

  show(txId: string) {
    this.activeId = txId
  }

  hide() {
    this.activeId = null
  }
}

export const uiTransactionStore = new UITransactionStore()
