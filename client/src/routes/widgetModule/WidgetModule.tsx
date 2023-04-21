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
import { isRedditUrl, isStakingWidgetUrl } from '../../utils/validation'
import { BaseText, SmallText } from '../../components/Text'
import { Box } from 'grommet/components/Box'
import { WidgetStatusWrapper } from '../../components/widgets/WidgetStatusWrapper'
import { sleep } from '../../utils/sleep'
import config from '../../../config'
import commandValidator, {
  CommandValidator,
  CommandValidatorEnum,
} from '../../utils/commandValidator'

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
    const handlingCommand = async () => {
      await commandHandler(utilsStore.command, true)
    }
    const connectWallet = async () => {
      await walletStore.connect()
    }
    try {
      console.log('utilsStore.command', utilsStore.command)
      if (utilsStore.command) {
        if (!walletStore.isConnected) {
          connectWallet()
        }
        domainStore.isOwner && handlingCommand()
      }
    } catch (e) {
      console.log('Handling command from URL', { error: e })
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
    } catch (ex) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: <BaseText>{ex.message}</BaseText>,
      })
      setLoading(false)
    }
  }

  const vanityHandler = async (vanity: CommandValidator) => {
    const urlExists = await rootStore.vanityUrlClient.existURL({
      name: domainName,
      aliasName: vanity.aliasName,
    })
    const method = urlExists ? 'updateURL' : 'addNewURL'
    console.log('CHECKING', vanity.aliasName, urlExists)
    setLoading(true)
    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: (
        <BaseText>{`${urlExists ? 'Updating' : 'Creating'} ${
          vanity.aliasName
        } url`}</BaseText>
      ),
    })
    const result = await rootStore.vanityUrlClient[method]({
      name: domainName,
      aliasName: vanity.aliasName,
      url: vanity.url,
      price: config.vanityUrl.price + '',
      onTransactionHash: () => {
        setProcessStatus({
          type: ProcessStatusTypes.PROGRESS,
          render: <BaseText>Waiting for transaction confirmation</BaseText>,
        })
      },
      onSuccess: ({ transactionHash }) => {
        console.log('success', transactionHash)
        setProcessStatus({
          type: ProcessStatusTypes.SUCCESS,
          render: (
            <BaseText>
              <a
                href={vanity.url}
              >{`${domainName}${config.tld}/${vanity.aliasName}`}</a>
              {` ${urlExists ? 'updated' : 'created'}`}
            </BaseText>
          ),
        })
      },
      onFailed: (ex: Error) => {
        console.log('ERRROR', ex)
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: (
            <BaseText>
              Error ${urlExists ? 'updating' : 'creating'} Vanity URL
            </BaseText>
          ),
        })
      },
    })
    setLoading(false)
  }

  const commandHandler = (text: string, fromUrl = false) => {
    const command = commandValidator(text)

    switch (command.type) {
      case CommandValidatorEnum.VANITY:
        console.log(CommandValidatorEnum.VANITY)
        vanityHandler(command)
        break
      case CommandValidatorEnum.EMAIL_ALIAS:
        console.log(CommandValidatorEnum.EMAIL_ALIAS, command)
        // works with value => email and value => aliasName=email
        window.open(`mailto:1country@harmony.one`, '_self')
        break
      case CommandValidatorEnum.URL:
        console.log(CommandValidatorEnum.URL)
        addPost(text, fromUrl)
        break
      default:
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: 'Invalid input',
        })
    }
    if (fromUrl) {
      sleep(3000)
      history.pushState(null, '', `\\`)
      utilsStore.command = undefined
    }
  }

  const enterHandler = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return
    }
    event.preventDefault()
    const value = (event.target as HTMLInputElement).value || ''
    commandHandler(value)
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
