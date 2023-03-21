import { BaseStore } from '../../../stores/BaseStore'
import { RootStore } from '../../../stores/RootStore'
import { action, makeObservable, observable } from 'mobx'
import { rootStore } from '../../../stores'
import { DomainPrice, DomainRecord } from '../../../api'
import debounce from 'lodash.debounce'
import { nameUtils } from '../../../api/utils'
import BN from 'bn.js'
import { parseTweetId } from '../../../utils/parseTweetId'
import { TransactionReceipt } from 'web3-core'
import logger from '../../../modules/logger';
const log = logger.module('HomeSearchStore');

const regx = /^[a-zA-Z0-9]{1,}((?!-)[a-zA-Z0-9]{0,}|-[a-zA-Z0-9]{1,})+$/

export const isValidDomainName = (domainName: string) => {
  console.log('isValidDomain', domainName)
  return regx.test(domainName)
}

const { tweetId } = parseTweetId(
  'https://twitter.com/harmonyprotocol/status/1621679626610425857?s=20&t=SabcyoqiOYxnokTn5fEacg'
)

export class HomeSearchStore extends BaseStore {
  searchString: string = ''
  secret: string

  searchResult: {
    domainName: string
    record: DomainRecord
    price: DomainPrice
  }

  constructor(rootStore: RootStore) {
    super(rootStore)

    makeObservable(
      this,
      {
        searchResult: observable,
        registerDomain: action,
        loadDomainRecord: action,
      },
      { autoBind: true }
    )

    this.secret = Math.random().toString(26).slice(2)
  }

  loadDomainRecord = debounce(async (domainName: string) => {
    try {
      const record = await this.getDCClient().getRecord({
        name: domainName,
      })

      const price = await this.getDCClient().getPrice({
        name: domainName,
      })

      this.searchResult = {
        domainName,
        record,
        price,
      }
    } catch (ex) {
      // setLoading(false)
    }
  }, 500)

  async registerDomain() {
    const { domainName, record, price } = this.searchResult

    if (!record || !isValidDomainName(domainName)) {
      return false
    }

    const { walletStore, uiTransactionStore } = this.stores

    const uiTx = uiTransactionStore.create()
    uiTransactionStore.show(uiTx.id)

    uiTx.setStatusProgress()

    if (
      domainName.length <= 2 &&
      nameUtils.isReservedName(domainName.toLowerCase())
    ) {
      uiTx.setError({
        message: 'This domain name is reserved for special purpose',
      })
      return
    }

    try {
      if (!walletStore.isConnected) {
        await walletStore.connect()
      }
    } catch (e) {
      log.error('Register Domain', { error: e });
      return
    }

    try {
      await this.getDCClient().commit({
        name: domainName.toLowerCase(),
        secret: this.secret,
        onTransactionHash: (txHash) => {
          uiTx.setTxHash(txHash)
        },
        onFailed: () => {
          uiTx.setStatusFail()
        },
        onSuccess: (tx: TransactionReceipt) => {
          console.log(tx)
          uiTx.setStatusSuccess()
        },
      })
    } catch (ex) {
      uiTx.setError(ex)
      uiTx.setStatusFail()
      return
    }

    try {
      const tx = await this.getDCClient().rent({
        name: domainName,
        secret: this.secret,
        url: tweetId.toString(),
        amount: new BN(price.amount).toString(),
        onTransactionHash: (txHash) => {
          uiTx.setTxHash(txHash)
        },
        onFailed: () => {
          uiTx.setStatusFail()
        },
        onSuccess: (tx: TransactionReceipt) => {
          console.log(tx)
          uiTx.setStatusSuccess()
        },
      })
    } catch (ex) {
      uiTx.setError(ex)
      uiTx.setStatusFail()
      return
    }
  }
}

export const homeSearchStore = new HomeSearchStore(rootStore)
