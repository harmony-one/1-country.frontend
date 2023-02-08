import axios from 'axios'
import { BaseStore } from '../../stores/BaseStore'
import { RootStore } from '../../stores/RootStore'
import { rootStore } from '../../stores'
import { action, makeObservable, observable } from 'mobx'
import config from '../../../config'

export interface Widget {
  id: string
  type: string
  value: string
}

interface Message {
  id: string
  domain: string
  content: { value: string; type: string }
}

const API_HOST = config.backendHost

const mapMessageToWidget = (message: Message): Widget => {
  return {
    id: message.id,
    value: message.content.value,
    type: message.content.type,
  }
}

const mapWidgetToMessage = (
  widget: Partial<Widget>,
  domain: string
): Message => {
  return {
    id: '',
    domain,
    content: {
      type: widget.type,
      value: widget.value,
    },
  }
}

class OpenWidgetsPageStore extends BaseStore {
  widgetList: Widget[] = []

  constructor(rootStore: RootStore) {
    super(rootStore)

    makeObservable(
      this,
      {
        widgetList: observable,
        loadWidgetList: action,
        deleteWidget: action,
      },
      { autoBind: true }
    )
  }

  async createWidget(widget: Omit<Widget, 'id'>) {
    const domainName = this.rootStore.domainStore.domainName

    const message = mapWidgetToMessage(widget, domainName)

    try {
      const response = await axios.post<{ data: Message }>(
        `${API_HOST}/messages`,
        message
      )

      this.widgetList = [
        mapMessageToWidget(response.data.data),
        ...this.widgetList,
      ]
    } catch (ex) {
      console.log('### ex', ex)
    }
  }

  async deleteWidget(widgetId: string) {
    try {
      await axios.delete(`${API_HOST}/messages/${widgetId}`)

      this.widgetList = this.widgetList.filter((item) => item.id !== widgetId)
    } catch (ex) {
      console.log('### ex', ex)
    }
  }

  async loadWidgetList() {
    const domainName = this.rootStore.domainStore.domainName

    try {
      const response = await axios.get<{ data: Message[] }>(
        `${API_HOST}/messages?domain=${domainName}`
      )
      this.widgetList = response.data.data.map(mapMessageToWidget)
    } catch (ex) {
      console.log('### ex', ex)
    }
  }
}

export const openWidgetsPageStore = new OpenWidgetsPageStore(rootStore)
