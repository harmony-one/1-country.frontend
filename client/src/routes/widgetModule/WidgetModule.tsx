import React, { useEffect, useState } from 'react'
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
import {
  isEmail,
  isRedditUrl,
  isStakingWidgetUrl,
} from '../../utils/validation'
import { BaseText, SmallText } from '../../components/Text'
import { Box } from 'grommet/components/Box'
import { WidgetStatusWrapper } from '../../components/widgets/WidgetStatusWrapper'
import { sleep } from '../../utils/sleep'
import config from '../../../config'

const defaultFormFields = {
  widgetValue: '',
}

interface Props {
  domainName: string
}

export const WidgetModule: React.FC<Props> = observer(({ domainName }) => {
  const { domainStore, walletStore, utilsStore, rootStore } = useStores()
  const [checkIsActivated, setCheckIsActivated] = useState(false)
  const [processStatus, setProcessStatus] = useState<ProcessStatusItem>({
    type: ProcessStatusTypes.IDLE,
    render: '',
  })

  useEffect(() => {
    const addingPost = async () => {
      await addPost(utilsStore.post, true)
    }
    const connectWallet = async () => {
      await walletStore.connect()
    }
    try {
      if (utilsStore.post) {
        if (!walletStore.isConnected) {
          connectWallet()
        }
        domainStore.isOwner && addingPost()
      }
    } catch (e) {
      console.log('Adding post from URL', { error: e })
      return
    }
  }, [walletStore.isConnected])

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

  const addPost = async (url: string, fromUrl = false) => {
    setLoading(true)

    let widget: Widget
    if (fromUrl) {
      setProcessStatus({
        type: ProcessStatusTypes.PROGRESS,
        render: <BaseText>Adding post from url</BaseText>,
      })
      await sleep(3000)
    }

    if (isStakingWidgetUrl(url)) {
      widget = {
        type: 'staking',
        value: url,
      }
    } else {
      setProcessStatus({
        type: ProcessStatusTypes.PROGRESS,
        render: 'Embedding post',
      })

      if (!isValidUrl(url)) {
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: 'Invalid URL',
        })
        setLoading(false)
        return
      }

      if (isRedditUrl(url)) {
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: 'Incompatible URL. Please try a URL from another website.',
        })
        setLoading(false)
        return
      }
      setProcessStatus({
        type: ProcessStatusTypes.PROGRESS,
        render: 'Checking URL',
      })
      await sleep(1000)
      const embedData = await loadEmbedJson(url).catch(() => false)

      if (!embedData) {
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: `Error processing URL. Please try using another URL`,
        })
        setLoading(false)
        return
      }

      widget = {
        type: 'url',
        value: url,
      }
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
      if (fromUrl) {
        history.pushState(null, '', `\\`) // deleting url param from browser
        utilsStore.post = undefined
      }
    } catch (ex) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: <BaseText>{ex.message}</BaseText>,
      })
      setLoading(false)
    }
  }

  const isVanityUrl = (value: string) => {
    return true
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

    // if (isVanityUrl(value)) {
    //   console.log('here i am')
    //   const aliasName = 'medium' //linkedin
    //   const url = 'https://medium.com/syncedreview/microsofts-parameter-efficient-z-code-language-model-beats-the-200x-larger-gpt3-175b-on-5c05f3dbf1a6'
    //   const exist = await rootStore.vanityUrlClient.existURL({
    //     name: domainName,
    //     aliasName: aliasName,
    //   })
    //   const fco = await rootStore.vanityUrlClient.getUrl({
    //     name: domainName,
    //     aliasName: aliasName,
    //   })
    //   console.log('url', fco)
    //   console.log(aliasName, domainName, exist)
    //   const exist2 = await rootStore.vanityUrlClient.existURL({
    //     name: domainName,
    //     aliasName: 'linkedin',
    //   })
    //   console.log('linkedin', domainName, exist2)
    //   // const vanity = await rootStore.vanityUrlClient.addNewURL({
    //   //   name: domainName,
    //   //   aliasName: aliasName,
    //   //   url: url,
    //   //   price: '1',
    //   //   onTransactionHash: () => {
    //   //     setProcessStatus({
    //   //       type: ProcessStatusTypes.PROGRESS,
    //   //       render: <BaseText>Waiting for transaction confirmation</BaseText>,
    //   //     })
    //   //   },
    //   //   onSuccess: ({ transactionHash }) => {
    //   //     console.log('success', transactionHash)
    //   //     setProcessStatus({
    //   //       type: ProcessStatusTypes.PROGRESS,
    //   //       render: <BaseText><a href={url}>{`${domainName}${config.tld}/${aliasName}`}</a> created</BaseText>,
    //   //     })
    //   //   },
    //   //   onFailed: (ex: Error) => {
    //   //     console.log('ERRROR', ex)
    //   //   }
    //   // })
    //   // console.log('FCOOOOOO', vanity)
    //   return
    // }

    addPost(value)
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
          />

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

      {domainStore.domainRecord && <TransactionWidget name={domainName} />}

      {!walletStore.isConnected && walletStore.isMetamaskAvailable && (
        <MetamaskWidget />
      )}
      {!walletStore.isMetamaskAvailable && <WalletConnectWidget />}
    </PageWidgetContainer>
  )
})
