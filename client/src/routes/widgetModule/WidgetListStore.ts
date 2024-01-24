import { action, makeObservable, observable, runInAction } from 'mobx'
import { BaseStore } from '../../stores/BaseStore'
import { RootStore } from '../../stores/RootStore'
import { rootStore } from '../../stores'
import { CallbackProps } from '../../api'
import isUrl from 'is-url'
import { Link, mainApi } from '../../api/mainApi'
import {
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../components/process-status/ProcessStatus'
import { PostInfo } from '../../api/postApi'
import { BigNumber, ethers } from 'ethers'
import { BN } from 'bn.js'

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

// const buildUrlFromWidget = (widget: Widget) => {
//   return widget.type + ':' + widget.value
// }

const buildUrlFromWidgets = (widgets: Widget[]) => {
  return widgets.map((widget) => widget.type + ':' + widget.value)
}

const mapUrlToWidget = (url: string, index: number, dbLink?: Link): Widget => {
  return {
    id: index,
    ...parseRawUrl(url),
    uuid: dbLink ? dbLink.id : null,
    isPinned: dbLink ? dbLink.isPinned : false,
  }
}

const sortWidgets = (a: Widget, b: Widget) => {
  if (b.isPinned || a.isPinned) {
    return +b.isPinned - +a.isPinned
  }
  return b.id - a.id
}

export class WidgetListStore extends BaseStore {
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
        _deleteWidget: action,
        setWidgetLoader: observable,
      },
      { autoBind: true }
    )
  }

  async createWidget(
    props: {
      widgets: Widget[]
      domainName: string
      nameSpace: string
    } & CallbackProps
  ) {
    const {
      widgets,
      domainName,
      nameSpace,
      onTransactionHash,
      onSuccess,
      onFailed,
    } = props

    try {
      if (!this.stores.walletStore.isConnected) {
        await this.stores.walletStore.connect()
      }

      const client = this.getPostClient()
      console.log('HERE', widgets, nameSpace)
      const result = await client.addNewPost({
        name: domainName,
        urls: buildUrlFromWidgets(widgets),
        nameSpace: nameSpace,
        onSuccess,
        onFailed,
        onTransactionHash,
      })
      console.log('HERE', result)
      const linkId = this.widgetList.length.toString()
      await mainApi.addLinks(domainName, linkId, widgets)

      await this.loadWidgetList(domainName, nameSpace)
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

  async pinWidget(widgetId: string, isPinned: boolean) {
    try {
      await mainApi.pinLink(widgetId, isPinned)
      runInAction(() => {
        this.widgetList = this.widgetList
          .map((widget) => {
            if (widget.uuid !== widgetId) {
              return {
                ...widget,
                isPinned: false, // Only one widget can be pinned
              }
            }
            return {
              ...widget,
              isPinned,
            }
          })
          .sort(sortWidgets)
      })
    } catch (e) {
      console.error('Cannot pin widget', e.message)
    }
  }

  async deleteLinks(widgets: Widget[]) {
    await widgets.map((widget) => {
      if (widget.uuid) {
        mainApi.deleteLink(widget.uuid)
      }
    })
  }

  async deleteWidget(props: {
    widgets: Widget[]
    domainName: string
    nameSpace: string
  }) {
    const { widgets, domainName, nameSpace } = props
    const processStatus = this.getWidgetLoader(widgets[0].id)
    if (processStatus.type !== ProcessStatusTypes.IDLE) {
      return
    }

    this.setWidgetLoader(widgets[0].id, {
      type: ProcessStatusTypes.PROGRESS,
      render: 'Waiting for a transaction to be signed',
    })

    try {
      const result = await this._deleteWidget({
        domainName,
        widgets,
        onTransactionHash: () => {
          this.setWidgetLoader(widgets[0].id, {
            type: ProcessStatusTypes.PROGRESS,
            render: 'Waiting for transaction confirmation',
          })
        },
      })

      if (result.error) {
        this.setWidgetLoader(widgets[0].id, {
          type: ProcessStatusTypes.ERROR,
          render: result.error.message,
        })
        throw result.error
      }

      await this.deleteLinks(widgets)

      this.setWidgetLoader(widgets[0].id, {
        type: ProcessStatusTypes.SUCCESS,
        render: 'Url successfully removed',
      })

      setTimeout(() => {
        this.setWidgetLoader(widgets[0].id, {
          type: ProcessStatusTypes.IDLE,
          render: '',
        })

        this.loadWidgetList(domainName, nameSpace)
      }, 3000)
    } catch (ex) {
      this.setWidgetLoader(widgets[0].id, {
        type: ProcessStatusTypes.ERROR,
        render: ex.message,
      })

      setTimeout(() => {
        this.setWidgetLoader(widgets[0].id, {
          type: ProcessStatusTypes.IDLE,
          render: '',
        })
      }, 3000)
    }
  }

  async _deleteWidget(
    props: { domainName: string; widgets: Widget[] } & CallbackProps
  ) {
    const { domainName, widgets, onSuccess, onTransactionHash, onFailed } =
      props
    console.log('_deleteWidget', domainName, { widgets })
    try {
      if (!this.stores.walletStore.isConnected) {
        await this.stores.walletStore.connect()
      }
      const client = this.getPostClient()
      const result = await client.deletePost({
        name: domainName,
        postIds: widgets.map((widget: Widget) =>
          ethers.BigNumber.from(widget.id)
        ),
        onSuccess,
        onFailed,
        onTransactionHash,
      })
      console.log('DELETE RESULT', result)
      return result
    } catch (ex) {
      console.log('### error delete url', ex)
    }
  }

  async loadWidgetList(domainName: string, nameSpace: string) {
    const client = this.getPostClient()
    const urlList = await client.getPosts({ name: domainName })
    let dbLinks: Link[] = []
    try {
      const { data } = await mainApi.getLinks(domainName)
      dbLinks = data.data
    } catch (e) {
      console.error('Cannot load database links', e.message)
    }
    runInAction(() => {
      this.widgetList = urlList
        .filter((post) => {
          return post.nameSpace === nameSpace
        })
        .map((post: PostInfo, index: number) => {
          const dbLink = dbLinks.find(
            (dbLink) => dbLink.linkId === index.toString()
          )
          return mapUrlToWidget(post.url, post.postId.toNumber(), dbLink) //index
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
}

export const widgetListStore = new WidgetListStore(rootStore)
