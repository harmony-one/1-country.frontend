import {RootStore} from "./RootStore";
import config from "../../config";

export const rootStore = new RootStore()

export const useStores = () => {
  return {
    modalStore: rootStore.modalStore,
    domainRecordStore: rootStore.domainRecordStore,
    rootStore: rootStore,
    walletStore: rootStore.walletStore
  }
}

if (config.debug) {
  // @ts-expect-error
  window.rootStore = rootStore;
}
