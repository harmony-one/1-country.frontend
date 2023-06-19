import { action, makeObservable, observable } from 'mobx'
import { ethers } from 'ethers'
import config from '../../config'
import { modalStore } from '../modules/modals/ModalContext'
import { ModalStore } from '../modules/modals/ModalStore'
import { RatesStore } from './RatesStore'
import { WalletStore } from './WalletStore'
import { DomainStore } from './DomainStore'
import { LoadersStore } from './LoadersStore'
import Constants from '../constants'
import apis, { D1DCClient } from '../api'
import {
  uiTransactionStore,
  UITransactionStore,
} from '../modules/transactions/UITransactionStore'
import { MetaTagsStore, metaTagsStore } from '../modules/metatags/MetaTagsStore'
import { wagmiClient } from '../modules/wagmi/wagmiClient'
import tweetApi, { TweetClient } from '../api/tweetApi'
import { ewsContractApi, EwsClient } from '../api/ews/ewsApi'
import commonApi, { CommonClient } from '../api/common'
import { UtilsStore } from './UtilsStore'
import { defaultProvider } from '../api/defaultProvider'
import { Web2AuthStore } from './Web2AuthStore'
import vanityApis, {
  VanityURLClient,
} from '../api/vanity-url/vanityContractClient'
import postApi, { PostClient } from '../api/postApi'
import { buildEasClient, EasClient } from '../api/eas/easContractClient'
import { NameWrapperClient, nameWrapperApi } from '../api/nameWrapperApi'
import { BaseRegistrarClient, baseRegistrarApi } from '../api/baseRegistrarApi'

export class RootStore {
  modalStore: ModalStore
  ratesStore: RatesStore
  d1dcClient: D1DCClient
  postClient: PostClient
  tweetClient: TweetClient
  ewsClient: EwsClient
  nameWrapper: NameWrapperClient
  baseRegistrar: BaseRegistrarClient
  vanityUrlClient: VanityURLClient
  easClient: EasClient
  commonClient: CommonClient
  domainStore: DomainStore
  walletStore: WalletStore
  uiTransactionStore: UITransactionStore

  stores: {
    modalStore: ModalStore
    ratesStore: RatesStore
    domainStore: DomainStore
    walletStore: WalletStore
    uiTransactionStore: UITransactionStore
    metaTagsStore: MetaTagsStore
    loadersStore: LoadersStore
    utilsStore: UtilsStore
    web2AuthStore: Web2AuthStore
  }

  constructor() {
    makeObservable(
      this,
      {
        d1dcClient: observable,
        updateClients: action,
      },
      { autoBind: true }
    )

    this.updateClients(defaultProvider, Constants.EmptyAddress)

    wagmiClient.autoConnect().then((result) => {
      console.log('### wagmi autoConnect')

      // web3 should works with harmony network
      if (result && result.chain.id === config.chainParameters.id) {
        const { account, provider } = result

        // @ts-expect-error FallbackProvide is not assignable
        const provider2 = new ethers.providers.Web3Provider(provider)
        this.updateClients(provider2, account)
      } else {
        console.log('### wallet connect to wrong network')
      }
    })

    this.modalStore = modalStore
    this.ratesStore = new RatesStore(this)
    this.walletStore = new WalletStore(this)
    this.domainStore = new DomainStore(this)
    this.uiTransactionStore = uiTransactionStore

    this.stores = {
      modalStore: this.modalStore,
      ratesStore: this.ratesStore,
      walletStore: this.walletStore,
      domainStore: this.domainStore,
      uiTransactionStore: this.uiTransactionStore,
      metaTagsStore: metaTagsStore,
      loadersStore: new LoadersStore(this),
      utilsStore: new UtilsStore(this),
      web2AuthStore: new Web2AuthStore(this),
    }
  }

  updateClients(
    provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider,
    address: string
  ) {
    console.log('### dc client updated', address)

    this.easClient = buildEasClient({ provider })
    this.d1dcClient = apis({ provider, address })
    this.postClient = postApi({ provider, address })
    this.tweetClient = tweetApi({ provider, address })
    this.vanityUrlClient = vanityApis({ provider, address })
    this.baseRegistrar = baseRegistrarApi({ provider, address })
    this.nameWrapper = nameWrapperApi({ provider, address })
    this.ewsClient = ewsContractApi({ provider, address })
    // @ts-ignore
    this.commonClient = commonApi(this.d1dcClient, this.tweetClient)
  }
}
