import { RootStore } from './RootStore'
import config from '../../config'

export const rootStore = new RootStore()

export const useStores = () => {
  return { ...rootStore.stores, rootStore: rootStore }
}

if (config.debug) {
  // @ts-expect-error
  window.rootStore = rootStore
  // @ts-expect-error
  window.stores = rootStore.stores
}
