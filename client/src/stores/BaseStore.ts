import { RootStore } from './RootStore'

export class BaseStore {
  public rootStore: RootStore

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
  }

  getDCClient() {
    return this.rootStore.d1dcClient
  }

  getPostClient() {
    return this.rootStore.postClient
  }

  getTweetClient() {
    return this.rootStore.tweetClient
  }

  getCommonClient() {
    return this.rootStore.commonClient
  }

  get stores() {
    return this.rootStore.stores
  }
}
