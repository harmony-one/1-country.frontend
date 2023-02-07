import { action, makeObservable, observable } from 'mobx'
import { BaseStore } from './BaseStore'
import { RootStore } from './RootStore'
import axios from 'axios'

export class RatesStore extends BaseStore {
  public ONE_USD = 0
  public loading = false

  constructor(rootStore: RootStore) {
    super(rootStore)

    makeObservable(
      this,
      {
        ONE_USD: observable,
        loading: observable,
        loadRates: action,
      },
      { autoBind: true }
    )

    this.loadRates()
  }

  loadRate<ID extends 'harmony'>(id: ID): Promise<number> {
    return axios
      .get<Record<ID, { usd: number }>>(
        `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
      )
      .then((response) => {
        return response.data[id].usd
      })
  }

  async loadRates() {
    const [ONE_USD] = await Promise.all([this.loadRate('harmony')])

    this.ONE_USD = ONE_USD
  }
}
