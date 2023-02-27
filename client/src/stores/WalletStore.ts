import { computed, makeObservable, observable } from 'mobx'
import {
  connect,
  watchAccount,
  watchNetwork,
  GetNetworkResult,
  GetAccountResult,
} from '@wagmi/core'
import Web3 from 'web3'
import { BaseStore } from './BaseStore'
import { RootStore } from './RootStore'
import {metamaskConnector, wagmiClient, walletConnectConnector} from '../modules/wagmi/wagmiClient'
import config from '../../config'

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

  _network: GetNetworkResult = {
    chain: undefined,
    chains: [],
  }

  constructor(rootStore: RootStore) {
    super(rootStore)
    makeObservable(
      this,
      {
        _network: observable,
        _account: observable,
        isConnected: computed,
        walletAddress: computed,
      },
      { autoBind: true }
    )

    watchAccount((account) => {
      this._account = account
    })

    watchNetwork((network) => {
      this._network = network
    })
  }

  get isConnecting() {
    return this._account.isConnecting
  }

  get isConnected() {
    return this._account.isConnected
  }

  get walletAddress() {
    return this._account.address
  }

  get isHarmonyNetwork() {
    return this._network.chain && this._network.chain.id
  }

  get isMetamaskAvailable() {
    return metamaskConnector && metamaskConnector.ready
  }

  connect() {
    const connector = metamaskConnector && metamaskConnector.ready
      ? metamaskConnector
      : walletConnectConnector
    return connect<typeof wagmiClient.provider>({
      chainId: config.chainParameters.id,
      connector,
    }).then((result) => {
      const provider = result.provider

      // @ts-expect-error
      const web3 = new Web3(provider)
      this.rootStore.updateD1DCClient(web3, result.account)
    })
  }
}
