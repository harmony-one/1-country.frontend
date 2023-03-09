import { RootStore } from './RootStore'

export class BaseStore {
  public rootStore: RootStore

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
  }

  getDCClient() {
    return this.rootStore.d1dcClient
  }

  getCommonClient() {
    return this.rootStore.commonClient
  }

  getTweetClient() {
    return this.rootStore.tweetClient
  }

  get stores() {
    return this.rootStore.stores
  }
}
