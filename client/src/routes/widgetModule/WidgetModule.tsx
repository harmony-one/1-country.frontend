import React, { useEffect, useState } from 'react'
import { useWeb3Modal } from '@web3modal/react'
import isValidUrl from 'is-url'

import { useStores } from '../../stores'
import {
  PageWidgetContainer,
  WidgetInputContainer,
} from '../../components/page-widgets/PageWidgets.styles'
import { observer } from 'mobx-react-lite'
import { Widget, widgetListStore } from './WidgetListStore'
import { TransactionWidget } from '../../components/widgets/TransactionWidget'

import { MetamaskWidget } from '../../components/widgets/MetamaskWidget'
import { WalletConnectWidget } from '../../components/widgets/WalletConnectWidget'
import {
  ProcessStatus,
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../../components/process-status/ProcessStatus'
import { WidgetStatusWrapper } from '../../components/widgets/WidgetStatusWrapper'
import { sleep } from '../../utils/sleep'
import config from '../../../config'
import commandValidator, {
  CommandValidator,
  CommandValidatorEnum,
} from '../../utils/command-handler/commandValidator'
import { renewCommand } from '../../utils/command-handler/DcCommandHandler'
import { relayApi } from '../../api/relayApi'
import { daysBetween } from '../../api/utils'

import { SearchInput } from '../../components/search-input/SearchInput'
import { MediaWidget } from '../../components/widgets/MediaWidget'
import { loadEmbedJson } from '../../modules/embedly/embedly'
import { isRedditUrl, isStakingWidgetUrl } from '../../utils/validation'
import { BaseText, SmallText } from '../../components/Text'
import { Box } from 'grommet/components/Box'
import { addNotionPageCommand } from '../../utils/command-handler/NotionCommandHandler'
import { ewsApi } from '../../api/ews/ewsApi'
import { isValidNotionPageId } from '../../../contracts/ews-common/notion-utils'

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
  const { open } = useWeb3Modal()

  useEffect(() => {
    const handlingCommand = async () => {
      await commandHandler(utilsStore.command, true)
    }
    const connectWallet = async () => {
      try {
        if (walletStore.isMetamaskAvailable) {
          await walletStore.connect()
        } else {
          open()
        }
      } catch (e) {
        if (e.name === 'UserRejectedRequestError') {
          open()
        }
      }
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
          render: (
            <BaseText>
              {result.error.message.length > 50
                ? result.error.message.substring(0, 50) + '...'
                : result.error.message}
            </BaseText>
          ),
        })
        resetProcessStatus(5000)
        return
      }

      setProcessStatus({
        type: ProcessStatusTypes.SUCCESS,
        render: <BaseText>Url successfully added</BaseText>,
      })
      resetProcessStatus(5000)
      resetInput()
    } catch (ex) {
      ;<BaseText>
        {ex.message.length > 50
          ? ex.message.substring(0, 50) + '...'
          : ex.message}
      </BaseText>
      resetProcessStatus(4000)
      setLoading(false)
    }
  }

  const vanityHandler = async (vanity: CommandValidator) => {
    const urlExists = await rootStore.vanityUrlClient.existURL({
      name: domainName,
      aliasName: vanity.aliasName,
    })
    const method = urlExists ? 'updateURL' : 'addNewURL'
    setLoading(true)
    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: (
        <BaseText>{`${
          urlExists ? 'Updating' : 'Creating'
        } ${`${domainName}${config.tld}/${vanity.aliasName}`} url`}</BaseText>
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
              Error {urlExists ? 'updating' : 'creating'} Vanity URL
            </BaseText>
          ),
        })
      },
    })
    resetProcessStatus(5000)
    resetInput()
    setLoading(false)
  }

  const renewCommandHandler = async () => {
    setLoading(true)
    try {
      const nftData = await relayApi().getNFTMetadata({
        domain: `${domainName}${config.tld}`,
      })
      const days = daysBetween(
        nftData['registrationDate'],
        domainStore.domainRecord.expirationTime
      )
      console.log({ nftData })
      console.log(days)
      if (days <= config.domain.renewalLimit) {
        setProcessStatus({
          type: ProcessStatusTypes.PROGRESS,
          render: <BaseText>{`Renewing ${domainName}${config.tld}`}</BaseText>,
        })
        if (!walletStore.isHarmonyNetwork || !walletStore.isConnected) {
          await walletStore.connect()
        }
        console.log(
          'domainStore.domainPrice.amount',
          domainStore.domainPrice.amount
        )
        const amount = domainStore.domainPrice.amount
        await renewCommand(domainName, amount, rootStore, setProcessStatus)

        await domainStore.loadDomainRecord(domainName)

        resetInput()
      } else {
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: <BaseText>{`Error: Renewal Limit Reached`}</BaseText>,
        })
      }
      resetProcessStatus(5000)
      setLoading(false)
    } catch (error) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: (
          <BaseText>{`Error while renewing ${domainName}${config.tld}`}</BaseText>
        ),
      })
      console.log(error)
      resetProcessStatus(5000)
      setLoading(false)
    }
  }

  const addNotionPageHandler = async (command: CommandValidator) => {
    setLoading(true)
    try {
      setProcessStatus({
        type: ProcessStatusTypes.PROGRESS,
        render: <BaseText>Validating Notion URL</BaseText>,
      })
      const notionPageId = await ewsApi.parseNotionPageIdFromRawUrl(command.url)
      console.log('pageId', notionPageId)
      if (isValidNotionPageId(notionPageId) && notionPageId !== '') {
        const tx = await addNotionPageCommand(
          domainStore.domainName,
          command.aliasName,
          notionPageId,
          rootStore,
          setProcessStatus
        )
        if (tx) {
          console.log('result', tx)
          setProcessStatus({
            type: ProcessStatusTypes.SUCCESS,
            render: <BaseText>Notion page embedded</BaseText>,
          })
          resetProcessStatus(5000)
          resetInput()
          setLoading(false)
          return
        }
      } else {
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: <BaseText>Invalid Notion page id</BaseText>,
        })
        resetProcessStatus(5000)
        setLoading(false)
      }
    } catch (e) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: (
          <BaseText>
            Error processing the URL. Please verify its a valid Notion URL
          </BaseText>
        ),
      })
      console.log(e)
      resetProcessStatus(5000)
      setLoading(false)
    }
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
      case CommandValidatorEnum.STAKING:
        console.log(CommandValidatorEnum.STAKING)
        addPost(command.url, fromUrl)
        break
      case CommandValidatorEnum.RENEW:
        console.log(CommandValidatorEnum.RENEW)
        renewCommandHandler()
        break
      case CommandValidatorEnum.NOTION:
        console.log('here i am')
        addNotionPageHandler(command)
        console.log(CommandValidatorEnum.NOTION, command)
        // renewCommandHandler()
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

  const deleteWidget = (widget: Widget) => {
    return widgetListStore.deleteWidget({
      widgetId: widget.id,
      widgetUuid: widget.uuid,
      domainName,
    })
  }

  const pinWidget = (widget: Widget, isPinned: boolean) => {
    return widgetListStore.pinWidget(widget.uuid, isPinned)
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
          key={widget.id + widget.value + +widget.isPinned}
          loaderId={widgetListStore.buildWidgetLoaderId(widget.id)}
        >
          <MediaWidget
            domainName={domainName}
            value={widget.value}
            uuid={widget.uuid}
            isPinned={widget.isPinned}
            isOwner={domainStore.isOwner}
            onDelete={() => deleteWidget(widget)}
            onPin={(isPinned: boolean) => pinWidget(widget, isPinned)}
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
