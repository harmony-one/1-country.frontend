import { RootStore } from './RootStore'
import config from '../../config'

export const rootStore = new RootStore()

export const useStores = () => {
  return {
    rootStore: rootStore,
    modalStore: rootStore.modalStore,
    ratesStore: rootStore.ratesStore,
  }
}

if (config.debug) {
  // @ts-expect-error
  window.rootStore = rootStore
}
