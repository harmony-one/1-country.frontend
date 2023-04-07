import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useStores } from '../../stores'
import {
  PageWidgetContainer,
  WidgetInputContainer,
} from '../../components/page-widgets/PageWidgets.styles'
import { observer } from 'mobx-react-lite'
import { Widget, widgetListStore } from './WidgetListStore'
import { TransactionWidget } from '../../components/widgets/TransactionWidget'
import isValidUrl from 'is-url'
import { MetamaskWidget } from '../../components/widgets/MetamaskWidget'
import { WalletConnectWidget } from '../../components/widgets/WalletConnectWidget'
import {
  ProcessStatus,
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../components/process-status/ProcessStatus'
import { SearchInput } from '../../components/search-input/SearchInput'
import { MediaWidget } from '../../components/widgets/MediaWidget'
import { loadEmbedJson } from '../../modules/embedly/embedly'
import { isEmail, isRedditUrl } from '../../utils/validation'
import { BaseText, SmallText } from '../../components/Text'
import { Box } from 'grommet/components/Box'
import { WidgetStatusWrapper } from '../../components/widgets/WidgetStatusWrapper'
import styled from 'styled-components'
import DataListInput from 'react-datalist-input'
// import 'react-datalist-input/dist/styles.css'

const defaultFormFields = {
  widgetValue: '',
}

interface Props {
  domainName: string
}

const StyledDatalist = styled.datalist`
  position: absolute !important;
  width: 100% !important;
  top: 40px !important;
  margin: 0 !important;
  padding: 0 !important;
  list-style: none !important;
  border: 1px solid #dfe1e5 !important;
  border-top: none !important;
  border-radius: 0 0 8px 8px !important;
  background-color: #fff !important;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05), 0 2px 2px rgba(0, 0, 0, 0.05),
    0 4px 4px rgba(0, 0, 0, 0.05), 0 8px 8px rgba(0, 0, 0, 0.05),
    0 16px 16px rgba(0, 0, 0, 0.05) !important;
`

const StyledOption = styled.option`
  padding: 10px !important;
  font-size: 16px !important;
  color: #202124 !important;
`

export const WidgetModule: React.FC<Props> = observer(({ domainName }) => {
  const { domainStore, walletStore } = useStores()
  const [checkIsActivated, setCheckIsActivated] = useState(false)
  const [options, setOptions] = useState([
    {
      label: '/email test@mail.com | add email forwarding',
      value: '/email ',
      id: '1',
    },
    {
      label: '/staking stakingUrl | add staking widget',
      value: '/staking ',
      id: '2',
    },
  ])
  const [processStatus, setProcessStatus] = useState<ProcessStatusItem>({
    type: ProcessStatusTypes.IDLE,
    render: '',
  })

  useEffect(() => {
    domainStore.loadDomainRecord(domainName)
  }, [domainName])

  useEffect(() => {
    const checkActivated = async () => {
      await widgetListStore.loadIsActivated(domainName)
      setCheckIsActivated(true)
    }
    widgetListStore.loadWidgetList(domainName)
    widgetListStore.loadDomainTx(domainName)
    checkActivated()
  }, [domainName])

  const [isLoading, setLoading] = useState(false)
  const [formFields, setFormFields] = useState(defaultFormFields)

  const resetProcessStatus = (time = 2000) => {
    setTimeout(() => {
      setProcessStatus({
        type: ProcessStatusTypes.IDLE,
        render: '',
      })
    }, time)
  }

  const resetInput = () => {
    setFormFields({ ...formFields, widgetValue: '' })
  }

  const enterHandler = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return
    }
    event.preventDefault()
    const value = (event.target as HTMLInputElement).value || ''

    if (isEmail(value)) {
      window.open(`mailto:1country@harmony.one`, '_self')
      return
    }
    setLoading(true)

    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: 'Embedding post',
    })

    if (!isValidUrl(value)) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: 'Invalid URL',
      })
      setLoading(false)
      return
    }

    if (isRedditUrl(value)) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: 'Incompatible URL. Please try a URL from another website.',
      })
      setLoading(false)
      return
    }
    // const isTwit = isValidTwitUri(value)
    // const isInst = isValidInstagramUri(value)

    // if (!isInst && !isTwit) {
    //   setProcessStatus({
    //     type: ProcessStatusTypes.ERROR,
    //     render: 'Invalid URL',
    //   })
    //   setLoading(false)
    //   return
    // }

    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: 'Checking URL',
    })

    const embedData = await loadEmbedJson(value).catch(() => false)

    if (!embedData) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: `Error processing URL. Please try using another URL`,
      })
      setLoading(false)
      return
    }

    const widget: Widget = {
      type: 'url',
      value: value,
    }

    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: <BaseText>Waiting for a transaction to be signed</BaseText>,
    })

    try {
      const result = await widgetListStore.createWidget({
        widget,
        domainName,
        onTransactionHash: () => {
          setProcessStatus({
            type: ProcessStatusTypes.PROGRESS,
            render: <BaseText>Waiting for transaction confirmation</BaseText>,
          })
        },
      })

      setLoading(false)

      if (result.error) {
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: <BaseText>{result.error.message}</BaseText>,
        })
        return
      }
      setProcessStatus({
        type: ProcessStatusTypes.SUCCESS,
        render: <BaseText>Url successfully added</BaseText>,
      })
      resetProcessStatus()
      resetInput()
    } catch (ex) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: <BaseText>{ex.message}</BaseText>,
      })
      setLoading(false)
    }
  }

  const onChange = (value: string) => {
    setFormFields({ ...formFields, widgetValue: value })
    if (!value) {
      resetProcessStatus(0)
    }
  }

  const deleteWidget = async (widgetId: number) => {
    widgetListStore.deleteWidget({ widgetId, domainName })
  }

  const showInput = walletStore.isConnected && domainStore.isOwner

  const onSelect = useCallback((selectedItem: any) => {
    console.log('selectedItem', selectedItem)
  }, [])

  return (
    <PageWidgetContainer>
      {showInput && (
        <WidgetInputContainer>
          <SearchInput
            autoFocus
            disabled={isLoading}
            isValid={processStatus.type !== ProcessStatusTypes.ERROR}
            placeholder={'Enter tweet or any url'}
            value={formFields.widgetValue}
            onSearch={onChange}
            onKeyDown={enterHandler}
            list="options"
          />

          <datalist id="options">
            {options
              .filter((option) =>
                option.value
                  .toLowerCase()
                  .includes(formFields.widgetValue.toLowerCase())
              )
              .map((option) => (
                <option
                  key={option.id}
                  value={option.value}
                  label={option.label}
                />
              ))}
          </datalist>
          {checkIsActivated && !widgetListStore.isActivated && (
            <Box pad={{ top: '0.5em' }}>
              <SmallText>
                Your first transaction when trying to add a post is an
                activation transaction, which is followed by an addition
                transaction. Approval for both transactions are required to add
                a post.
              </SmallText>
            </Box>
          )}

          {processStatus.type !== ProcessStatusTypes.IDLE && (
            <Box align={'center'} margin={{ top: '8px' }}>
              <ProcessStatus status={processStatus} />
            </Box>
          )}
        </WidgetInputContainer>
      )}

      {widgetListStore.widgetList.map((widget, index) => (
        <WidgetStatusWrapper
          key={widget.id + widget.value}
          loaderId={widgetListStore.buildWidgetLoaderId(widget.id)}
        >
          <MediaWidget
            value={widget.value}
            isOwner={domainStore.isOwner}
            onDelete={() => deleteWidget(widget.id)}
          />
        </WidgetStatusWrapper>
      ))}

      {domainStore.domainRecord && (
        <TransactionWidget
          name={domainName}
          domainRecord={domainStore.domainRecord}
        />
      )}

      {!walletStore.isConnected && walletStore.isMetamaskAvailable && (
        <MetamaskWidget />
      )}
      {!walletStore.isMetamaskAvailable && <WalletConnectWidget />}
    </PageWidgetContainer>
  )
})
