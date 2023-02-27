import { computed, makeObservable, observable } from 'mobx'

export enum UITransactionStatus {
  INIT = 'init',
  WAITING_SIGN_IN = 'waiting_sign_in',
  PROGRESS = 'progress',
  SUCCESS = 'success',
  FAIL = 'fail',
}

export interface UITransactionConfig<Data = {}> {
  id?: string
  data?: Data
  titles?: Partial<Record<UITransactionStatus, string>>
}

export class UITransaction<Data = {}> {
  public id: string

  txHash: string | '' = ''

  data: Data

  status: UITransactionStatus

  _titles: Record<UITransactionStatus, string> = {
    [UITransactionStatus.WAITING_SIGN_IN]: 'Waiting for sign',
    [UITransactionStatus.SUCCESS]: 'Transaction success',
    [UITransactionStatus.PROGRESS]: 'Waiting for transaction',
    [UITransactionStatus.FAIL]: 'Transaction fail',
    [UITransactionStatus.INIT]: 'Init',
  }

  error: Error | { message: string }

  constructor(config: UITransactionConfig<Data>) {
    makeObservable(
      this,
      {
        title: computed,
        error: observable,
        txHash: observable,
        status: observable,
        errorMessage: computed,
        harmonyErrTxId: computed,
      },
      { autoBind: true }
    )

    this.id = (Date.now() + Math.random()).toString(16)

    this.data = config.data
    if (config.titles) {
      this._titles = { ...this._titles, ...config.titles }
    }
  }

  setStatusWaitingSignIn() {
    this.status = UITransactionStatus.WAITING_SIGN_IN
  }

  get title() {
    return this._titles[this.status]
  }

  setStatusProgress() {
    this.status = UITransactionStatus.PROGRESS
  }

  setStatusSuccess() {
    this.status = UITransactionStatus.SUCCESS
  }

  setStatusFail() {
    this.status = UITransactionStatus.FAIL
  }

  setTxHash(txHash: string) {
    this.txHash = txHash
  }

  setError(error: Error | { message: string }) {
    this.error = error
  }

  get errorMessage() {
    if (!this.error) {
      return ''
    }

    // https://docs.metamask.io/guide/ethereum-provider.html#events
    // @ts-ignore
    if (this.error.code && this.error.code === 4001) {
      return 'Request was rejected by the user'
    }

    // @ts-ignore
    if (this.error.code && this.error.code === -32602) {
      return 'The parameters were invalid'
    }

    // @ts-ignore
    if (this.error.code && this.error.code === -32603) {
      return 'Internal error'
    }

    // @ts-ignore
    if (this.error.receipt) {
      return this.error.message.split(':')[0]
    }

    return this.error.message
  }

  get harmonyErrTxId() {
    // @ts-ignore
    if (!this.error || !this.error.receipt) {
      return ''
    }

    // @ts-ignore
    return this.error.receipt.transactionHash
  }
}
