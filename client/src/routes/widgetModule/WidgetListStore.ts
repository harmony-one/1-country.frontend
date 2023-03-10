import { action, makeObservable, observable, runInAction } from 'mobx'
import { BaseStore } from '../../stores/BaseStore'
import { RootStore } from '../../stores/RootStore'
import { rootStore } from '../../stores'
import { CallbackProps } from '../../api'
import isUrl from 'is-url'
import { mainApi } from '../../api/mainApi'

export interface Widget {
  id?: number
  type: string
  value: string
}

const parseRawUrl = (url: string): Widget => {
  const [type, ...rest] = url.split(':')

  let value = rest.join(':')

  // backward compatibility for twitter identity
  if (!isUrl(value) && type === 'twitter') {
    value = `https://twitter.com/${value}`
    console.log('### value', value)
  }

  return {
    type,
    value,
  }
}

const buildUrlFromWidget = (widget: Widget) => {
  return widget.type + ':' + widget.value
}

const mapUrlToWidget = (url: string, index: number): Widget => {
  return {
    id: index,
    ...parseRawUrl(url),
  }
}

class WidgetListStore extends BaseStore {
  widgetList: Widget[] = []
  txDomainLoading: boolean = false
  txDomain: string = ''

  constructor(rootStore: RootStore) {
    super(rootStore)

    makeObservable(
      this,
      {
        txDomainLoading: observable,
        txDomain: observable,
        loadDomainTx: action,
        widgetList: observable,
        loadWidgetList: action,
        deleteWidget: action,
      },
      { autoBind: true }
    )
  }

  async createWidget(
    props: { widget: Widget; domainName: string } & CallbackProps
  ) {
    const { widget, domainName, onTransactionHash, onSuccess, onFailed } = props

    try {
      if (!this.stores.walletStore.isConnected) {
        await this.stores.walletStore.connect()
      }

      const client = this.getTweetClient()
      const isActivated = await client.isActivated(domainName)
      console.log('isActivated', isActivated)

      if (!isActivated) {
        const rentalPrice = await client.baseRentalPrice()
        await client.activate({
          name: domainName,
          amount: rentalPrice,
        })
        await new Promise((resolve) => setTimeout(resolve, 5000))
      }

      const result = await client.addRecordUrl({
        name: domainName,
        url: buildUrlFromWidget(widget),
        onSuccess,
        onFailed,
        onTransactionHash,
      })

      await this.loadWidgetList(domainName)
      return result
    } catch (ex) {
      console.log('### add url error', ex)
    }
  }

  async deleteWidget(
    props: { domainName: string; widgetId: number } & CallbackProps
  ) {
    const { domainName, widgetId, onSuccess, onTransactionHash, onFailed } =
      props

    try {
      if (!this.stores.walletStore.isConnected) {
        await this.stores.walletStore.connect()
      }
      const client = this.getTweetClient()
      const result = await client.removeRecordUrl({
        name: domainName,
        pos: widgetId,
        onSuccess,
        onFailed,
        onTransactionHash,
      })

      await this.loadWidgetList(domainName)

      return result
    } catch (ex) {
      console.log('### error delete url', ex)
    }
  }

  async loadWidgetList(domainName: string) {
    const client = this.getTweetClient()
    const urlList = await client.getRecordUrlList({ name: domainName })

    runInAction(() => {
      this.widgetList = urlList.map(mapUrlToWidget).reverse()
    })
  }

  async loadDomainTx(domainName: string) {
    this.txDomainLoading = true

    try {
      const domain = await mainApi.loadDomain({ domain: domainName })

      runInAction(() => {
        this.txDomainLoading = false
        this.txDomain = domain.createdTxHash
        return domain.createdTxHash
      })
    } catch (ex) {
      runInAction(() => {
        this.txDomainLoading = false
      })
      return ''
    }
  }
}

export const widgetListStore = new WidgetListStore(rootStore)
