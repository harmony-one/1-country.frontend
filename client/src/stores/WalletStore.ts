import { BaseStore } from './BaseStore'
import { RootStore } from './RootStore'
import { makeObservable, observable } from 'mobx'
import { wagmiClient } from '../modules/wagmi/wagmiClient'

export class WalletStore extends BaseStore {
  isConnected: boolean = false
  walletAddress: string = ''

  constructor(rootStore: RootStore) {
    super(rootStore)
    makeObservable(
      this,
      {
        isConnected: observable,
        walletAddress: observable,
      },
      { autoBind: true }
    )
  }

  connect() {
    // TODO: fix wagmi connectors
    // @ts-expect-error
    return wagmiClient.connectors.connect()
  }
}
