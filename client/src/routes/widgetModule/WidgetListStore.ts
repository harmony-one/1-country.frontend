import {action, makeObservable, observable, runInAction, toJS} from 'mobx'
import { BaseStore } from '../../stores/BaseStore'
import { RootStore } from '../../stores/RootStore'
import { rootStore } from '../../stores'
import { CallbackProps } from '../../api'
import isUrl from 'is-url'
import {Link, mainApi} from '../../api/mainApi'
import {
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../components/process-status/ProcessStatus'

export interface Widget {
  id?: number
  type: string
  value: string
  uuid?: string
  isPinned?: boolean
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

const mapUrlToWidget = (url: string, index: number, dbLink?: Link): Widget => {
  return {
    id: index,
    ...parseRawUrl(url),
    uuid: dbLink ? dbLink.id: null,
    isPinned: dbLink ? dbLink.isPinned : false,
  }
}

const sortWidgets = (a: Widget, b: Widget) => {
  if(b.isPinned || a.isPinned) {
    return +b.isPinned - +a.isPinned
  }
  return b.id - a.id
}

class WidgetListStore extends BaseStore {
  widgetList: Widget[] = []
  txDomainLoading: boolean = false
  txDomain: string = ''
  isActivated: boolean = false

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
        _deleteWidget: action,
        setWidgetLoader: observable,
        loadIsActivated: action,
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

      this.isActivated = true

      const result = await client.addRecordUrl({
        name: domainName,
        url: buildUrlFromWidget(widget),
        onSuccess,
        onFailed,
        onTransactionHash,
      })

      const linkId = this.widgetList.length.toString()
      await mainApi.addLink(domainName, linkId, widget.value)

      await this.loadWidgetList(domainName)
      return result
    } catch (ex) {
      console.log('### add url error', ex)
    }
  }

  buildWidgetLoaderId(widgetId: number) {
    return 'widget_' + widgetId
  }

  setWidgetLoader(widgetId: number, processStatus: ProcessStatusItem) {
    const loaderId = this.buildWidgetLoaderId(widgetId)
    this.stores.loadersStore.setLoader(loaderId, processStatus)
  }

  getWidgetLoader(widgetId: number) {
    const id = this.buildWidgetLoaderId(widgetId)
    return this.stores.loadersStore.getLoader(id)
  }

  async pinWidget (widgetId: string, isPinned: boolean) {
    await mainApi.pinLink(widgetId, isPinned)
    runInAction(() => {
      this.widgetList = this.widgetList.map(widget => {
        if(widget.uuid !== widgetId) {
          return {
            ...widget,
            isPinned: false // Only one widget can be pinned
          }
        }
        return {
          ...widget,
          isPinned
        }
      }).sort(sortWidgets)
    })
  }

  async deleteWidget(props: { widgetId: number; widgetUuid?: string, domainName: string }) {
    const { widgetId, widgetUuid, domainName } = props
    console.log('delete widget', props)

    const processStatus = this.getWidgetLoader(widgetId)
    if (processStatus.type !== ProcessStatusTypes.IDLE) {
      return
    }

    this.setWidgetLoader(widgetId, {
      type: ProcessStatusTypes.PROGRESS,
      render: 'Waiting for a transaction to be signed',
    })

    try {
      const result = await this._deleteWidget({
        domainName,
        widgetId,
        onTransactionHash: () => {
          this.setWidgetLoader(widgetId, {
            type: ProcessStatusTypes.PROGRESS,
            render: 'Waiting for transaction confirmation',
          })
        },
      })

      if (result.error) {
        this.setWidgetLoader(widgetId, {
          type: ProcessStatusTypes.ERROR,
          render: result.error.message,
        })
        throw result.error
      }

      if(widgetUuid) {
        await mainApi.deleteLink(widgetUuid)
      }

      this.setWidgetLoader(widgetId, {
        type: ProcessStatusTypes.SUCCESS,
        render: 'Url successfully removed',
      })

      setTimeout(() => {
        this.setWidgetLoader(widgetId, {
          type: ProcessStatusTypes.IDLE,
          render: '',
        })

        this.loadWidgetList(domainName)
      }, 3000)
    } catch (ex) {
      this.setWidgetLoader(widgetId, {
        type: ProcessStatusTypes.ERROR,
        render: ex.message,
      })

      setTimeout(() => {
        this.setWidgetLoader(widgetId, {
          type: ProcessStatusTypes.IDLE,
          render: '',
        })
      }, 3000)
    }
  }

  async _deleteWidget(
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

      return result
    } catch (ex) {
      console.log('### error delete url', ex)
    }
  }

  async loadWidgetList(domainName: string) {
    const client = this.getTweetClient()
    const urlList = await client.getRecordUrlList({ name: domainName })

    let dbLinks: Link[] = []
    try {
      const { data } = await mainApi.getLinks(domainName)
      dbLinks = data.data
    } catch (e) {
      console.error('Cannot load database links', e.message)
    }

    runInAction(() => {
      this.widgetList = urlList.map((url: string, index: number) => {
        const dbLink = dbLinks.find((dbLink) => dbLink.linkId === index.toString())
        return mapUrlToWidget(url, index, dbLink)
      })
        .sort(sortWidgets)
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

  async loadIsActivated(domainName: string) {
    const client = this.getTweetClient()
    try {
      this.isActivated = await client.isActivated(domainName)
    } catch (ex) {
      console.log('### ex isActivated', ex)
    }
  }

  getWidgetByUrl (url: string) {
    const widget = this.widgetList
      .find(widget => widget.value === url)
    if(widget) {
      return toJS(widget)
    }
  }
}

export const widgetListStore = new WidgetListStore(rootStore)
