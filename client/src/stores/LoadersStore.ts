import {
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../components/process-status/ProcessStatus'
import { action, makeObservable, observable } from 'mobx'
import { RootStore } from './RootStore'
import { BaseStore } from './BaseStore'

const idleLoader = { type: ProcessStatusTypes.IDLE, render: '' }

export class LoadersStore extends BaseStore {
  _map: { [key: string]: ProcessStatusItem }

  constructor(rootStore: RootStore) {
    super(rootStore)
    makeObservable(
      this,
      {
        _map: observable,
        setLoader: action,
      },
      { autoBind: true }
    )
    this._map = {}
  }

  setLoader(id: string, status: ProcessStatusItem) {
    this._map[id] = status
  }

  getLoader(id: string): ProcessStatusItem {
    return this._map[id] || idleLoader
  }
}
