import { computed, makeObservable, observable, runInAction } from 'mobx'
import { ethers } from 'ethers'
import {
  connect,
  watchAccount,
  watchNetwork,
  GetNetworkResult,
  GetAccountResult,
} from '@wagmi/core'
import { BaseStore } from './BaseStore'
import { RootStore } from './RootStore'
import { metamaskConnector, wagmiConfig } from '../modules/wagmi/wagmiClient'
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
      runInAction(() => {
        this._account = account
      })
    })

    watchNetwork((network) => {
      runInAction(() => {
        this._network = network
      })
    })
  }

  get isConnecting() {
    return this._account.isConnecting
  }

  get isConnected() {
    return this._account.isConnected && this.isHarmonyNetwork
  }

  get walletAddress() {
    return this._account.address
  }

  get isHarmonyNetwork() {
    return (
      this._network.chain &&
      this._network.chain.id === config.chainParameters.id
    )
  }

  get isMetamaskAvailable() {
    return metamaskConnector && metamaskConnector.ready
  }

  setProvider(provider: unknown, address: string) {
    const web3Provider = new ethers.providers.Web3Provider(provider)
    this.rootStore.updateClients(web3Provider, address)
  }

  async connect() {
    const result = await connect({
      chainId: config.chainParameters.id,
      connector: metamaskConnector,
    })
    const { connector, account } = result
    this.setProvider(await connector.getProvider(), account)
  }
}

// connect() {
//   return connect({
//     chainId: config.chainParameters.id,
//     connector: metamaskConnector,
//   }).then(async (result) => {
//     result.connector.getProvider()
//     console.log('RESULT', result)
//     const { connector, account } = result
//     // const { provider, account } = result
//     console.log('connector', connector, account)
//     console.log('PROVIDER', await connector.getProvider())
//     this.setProvider(await connector.getProvider(), account)
//   })
// }
