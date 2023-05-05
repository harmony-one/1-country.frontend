import { RootStore } from './RootStore'

export class BaseStore {
  public rootStore: RootStore

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
  }

  getDCClient() {
    return this.rootStore.d1dcClient
  }

  getTweetClient() {
    return this.rootStore.tweetClient
  }

  getEwsClient() {
    return this.rootStore.ewsClient
  }

  getCommonClient() {
    return this.rootStore.commonClient
  }

  get stores() {
    return this.rootStore.stores
  }
}
