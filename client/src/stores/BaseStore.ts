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

  getEwsClient() {
    return this.rootStore.ewsClient
  }

  getCommonClient() {
    return this.rootStore.commonClient
  }

  getEasClient() {
    return this.rootStore.easClient
  }

  getNameWrapperClient() {
    return this.rootStore.nameWrapper
  }

  getBaseRegistrarClient() {
    return this.rootStore.baseRegistrar
  }

  get stores() {
    return this.rootStore.stores
  }
}
