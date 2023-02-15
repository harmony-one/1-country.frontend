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

  async loadWidgetList(domainName: string) {
    try {
      const response = await axios.get<{ data: Message[] }>(
        `${API_HOST}/messages?domain=${domainName}`
      )
      this.widgetList = response.data.data.map(mapMessageToWidget)
    } catch (ex) {
      console.log('### ex', ex)
    }
  }

  async loadDomainTx(name: string) {
    this.txDomainLoading = true

    try {
      const record = await this.rootStore.d1dcClient.getRecord({ name })

      const block = await this.findBlock(record.timeUpdated / 1000)

      const eventList = await this.rootStore.d1dcClient.contract.getPastEvents(
        'NameRented',
        {
          filter: {},
          fromBlock: block.number,
          toBlock: block.number,
        }
      )

      console.log('### eventList', eventList)

      const event = eventList.find((event) => {
        return (
          event.returnValues.name ===
          this.rootStore.d1dcClient.web3.utils.keccak256(name)
        )
      })
      console.log('### event', event)

      this.txDomainLoading = false
      this.txDomain = event.transactionHash
      return event.transactionHash
    } catch (ex) {
      this.txDomainLoading = false
      return ''
    }
  }

  async findBlock(blockTimeStamp = 1674732160) {
    let leftBlockNumber = 34902999
    let rightBlockNumber =
      await this.rootStore.d1dcClient.web3.eth.getBlockNumber()

    let leftBlock = await this.rootStore.d1dcClient.web3.eth.getBlock(
      leftBlockNumber
    )
    let rightBlock = await this.rootStore.d1dcClient.web3.eth.getBlock(
      rightBlockNumber
    )

    let counter = 0
    while (leftBlock.number <= rightBlock.number) {
      counter++
      let midBlockNumber = Math.floor(
        (leftBlock.number + rightBlock.number) / 2
      )
      let midBlock = await this.rootStore.d1dcClient.web3.eth.getBlock(
        midBlockNumber
      )
      if (blockTimeStamp === midBlock.timestamp) {
        console.log('### midBlock', midBlock)
        return midBlock
      }

      if (blockTimeStamp > midBlock.timestamp) {
        leftBlock = await this.rootStore.d1dcClient.web3.eth.getBlock(
          midBlockNumber + 1
        )
      } else {
        rightBlock = await this.rootStore.d1dcClient.web3.eth.getBlock(
          midBlockNumber - 1
        )
      }
    }
  }
}

export const openWidgetsPageStore = new OpenWidgetsPageStore(rootStore)
