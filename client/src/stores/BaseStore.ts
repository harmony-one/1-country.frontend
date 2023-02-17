import { RootStore } from './RootStore'

export class BaseStore {
  public rootStore: RootStore

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
  }

  getDCClient() {
    return this.rootStore.d1dcClient
  }
}
