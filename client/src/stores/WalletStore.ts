import { BaseStore } from './BaseStore'
import { RootStore } from './RootStore'
import { computed, makeObservable, observable } from 'mobx'
import { connect, GetAccountResult, watchAccount } from '@wagmi/core'
import { metamaskConnector } from '../modules/wagmi/wagmiClient'

export class WalletStore extends BaseStore {
  _account: GetAccountResult = {
    address: undefined,
    connector: undefined,
    isConnected: false,
    isReconnecting: false,
    isConnecting: false,
    isDisconnected: true,
    status: 'disconnected',
  }

  constructor(rootStore: RootStore) {
    super(rootStore)
    makeObservable(
      this,
      {
        _account: observable,
        isConnected: computed,
        walletAddress: computed,
      },
      { autoBind: true }
    )

    watchAccount((account) => {
      this._account = account
    })
  }

  get isConnected() {
    return this._account.isConnected
  }

  get walletAddress() {
    return this._account.address
  }

  connect() {
    return connect({
      connector: metamaskConnector,
    })
  }
}
