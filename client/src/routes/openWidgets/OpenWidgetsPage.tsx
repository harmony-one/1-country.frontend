import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useStores } from '../../stores'
import { WidgetInputContainer } from '../../components/page-widgets/PageWidgets.styles'
import { openWidgetsStore, Widget } from './OpenWidgetsStore'
import { Container } from '../home/Home.styles'
import { MediaWidget } from '../../components/widgets/MediaWidget'
import { SearchInput } from '../../components/search-input/SearchInput'
import {
  ProcessStatus,
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../components/process-status/ProcessStatus'
import { sleep } from '../../utils/sleep'
import isUrl from 'is-url'
import { loadEmbedJson } from '../../modules/embedly/embedly'
import { isValidInstagramUri, isValidTwitUri } from '../../utils/validation'

const defaultFormFields = {
  widgetValue: '',
}

export const OpenWidgetsPage = observer(() => {
  const { domainStore } = useStores()
  const [processStatus, setProcessStatus] = useState<ProcessStatusItem>({
    type: ProcessStatusTypes.PROGRESS,
    render: '',
  })

  useEffect(() => {
    domainStore.loadDomainRecord()
  }, [])

  const [widgetList, setWidgetList] = useState<Widget[]>([])
  const [loading, setLoading] = useState(false)
  const [formFields, setFormFields] = useState(defaultFormFields)

  useEffect(() => {
    openWidgetsStore.loadWidgetList()
  }, [])

  useEffect(() => {
    setWidgetList(openWidgetsStore.widgetList)
  }, [openWidgetsStore.widgetList])

  const terminateProcess = async (timer: number = 5000) => {
    await sleep(timer)
    setLoading(false)
    setProcessStatus({ type: ProcessStatusTypes.PROGRESS, render: '' })
  }

  const enterHandler = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return
    }
    event.preventDefault()
    setLoading(true)

    if (!isUrl(formFields.widgetValue)) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: 'Invalid URL entered',
      })
      terminateProcess(1000)
      return
    }

    const isTwit = isValidTwitUri(formFields.widgetValue)
    const isInst = isValidInstagramUri(formFields.widgetValue)

    if (!isInst && !isTwit) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: 'Invalid URL entered',
      })
      terminateProcess(1000)
      return
    }

    const embedData = await loadEmbedJson(formFields.widgetValue).catch(
      () => false
    )

    if (!embedData) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: `Sorry, we can't embed this URL`,
      })
      terminateProcess()
      return
    }

    const widget = {
      type: 'url',
      value: formFields.widgetValue,
    }

    openWidgetsStore
      .createWidget(widget)
      .then(() => {
        setProcessStatus({
          type: ProcessStatusTypes.SUCCESS,
          render: 'Post created',
        })

        terminateProcess(3000)
        setFormFields({ ...formFields, widgetValue: '' })
      })
      .catch((error) => {
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: error.message,
        })
        terminateProcess(3000)
      })
  }

  const onChange = (value: string) => {
    setFormFields({ ...formFields, widgetValue: value })
  }

  const deleteWidget = (widgetId: string) => {
    openWidgetsStore.deleteWidget(widgetId)
  }

  return (
    <Container>
      <div style={{ height: '2em' }} />
      <WidgetInputContainer>
        <SearchInput
          autoFocus
          disabled={loading}
          placeholder={'Enter tweet or instagram post url'}
          value={formFields.widgetValue}
          onSearch={onChange}
          onKeyDown={enterHandler}
        />
      </WidgetInputContainer>
      {loading && <ProcessStatus status={processStatus} />}
      {widgetList.length > 0 &&
        widgetList.map((widget) => (
          <MediaWidget
            isOwner
            key={widget.id}
            value={widget.value}
            onDelete={() => deleteWidget(widget.id)}
          />
        ))}
    </Container>
  )
})
