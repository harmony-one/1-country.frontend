import React, { useEffect, useState } from 'react'
import { useWeb3Modal } from '@web3modal/react'
import { useNavigate } from 'react-router'
import { observer } from 'mobx-react-lite'

import config from '../../../config'
import { useStores } from '../../stores'
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
import commandValidator, {
  CommandValidatorEnum,
} from '../../utils/command-handler/commandValidator'
import { renewCommandHandler } from '../../utils/command-handler/DcCommandHandler'
import { addNotionPageHandler } from '../../utils/command-handler/NotionCommandHandler'
import { SearchInput } from '../../components/search-input/SearchInput'
import { MediaWidget } from '../../components/widgets/MediaWidget'

import { Box } from 'grommet/components/Box'
import { Text } from 'grommet'
import { FlexRow } from '../../components/Layout'
import { addPostHandler } from '../../utils/command-handler/PostCommandHandler'
import { EmailHandler } from '../../utils/command-handler/EmailHandler'
import {
  domainWrapperHandler,
  transferDomainHandler,
} from '../../utils/command-handler/transferCommandHandler'
import { vanityUrlHandler } from '../../utils/command-handler/vanityUrlHandler'
import {
  PageWidgetContainer,
  WidgetInputContainer,
} from '../../components/page-widgets/PageWidgets.styles'
import { addSubstackPageHandler } from '../../utils/command-handler/SubstackCommandHandler'

const defaultFormFields = {
  widgetValue: '',
}

interface Props {
  domainName: string
}

export const WidgetModule: React.FC<Props> = observer(({ domainName }) => {
  const {
    domainStore,
    walletStore,
    utilsStore,
    rootStore,
    telegramWebAppStore,
  } = useStores()
  const [isTelegramMode, setIsTelegramMode] = useState(false)
  const [loadedWidgetList, setLoadedWidgetList] = useState(false)
  const [subPage, setSubPage] = useState('')
  const navigate = useNavigate()

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
        domainStore.isOwner &&
          setIsTelegramMode(telegramWebAppStore.isTelegramWebApp)
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
    const sub = window.location.pathname.split('/').pop()
    console.log('sub', sub)
    if (sub) {
      setSubPage(sub)
    }
    console.log('useffect', domainName, subPage)
    widgetListStore.loadWidgetList(domainName, sub)
    setLoadedWidgetList(true)
    widgetListStore.loadDomainTx(domainName)
    // checkActivated()
  }, [domainName])

  useEffect(() => {
    if (
      !domainStore.isOwner &&
      loadedWidgetList === true &&
      subPage !== '' &&
      widgetListStore.widgetList.length === 0
    ) {
      window.location.href = `https://${domainName}${config.tld}`
    }
  }, [widgetListStore.widgetList])

  const [isLoading, setLoading] = useState(false)
  const [formFields, setFormFields] = useState(defaultFormFields)

  const resetProcessStatus = (time = 3000) => {
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

  const commandHandler = async (text: string, fromUrl = false) => {
    const command = commandValidator(text)
    let result = false
    setLoading(true)
    switch (command.type) {
      case CommandValidatorEnum.VANITY:
        console.log(CommandValidatorEnum.VANITY)
        result = await vanityUrlHandler({
          vanity: command,
          fromUrl,
          domainName,
          rootStore,
          setProcessStatus,
        })
        break
      case CommandValidatorEnum.EMAIL_ALIAS:
        // works with value => email and value => aliasName=email
        console.log(CommandValidatorEnum.EMAIL_ALIAS, command)
        result = await EmailHandler({
          alias: command.aliasName,
          forward: command.email,
          fromUrl,
          domainName,
          walletStore,
          rootStore,
          setProcessStatus,
        })
        break
      case CommandValidatorEnum.URL:
      case CommandValidatorEnum.STAKING:
      case CommandValidatorEnum.IFRAME:
        result = await addPostHandler({
          url: command.url,
          fromUrl,
          domainName,
          subPage,
          walletStore,
          widgetListStore,
          setProcessStatus,
        })
        break
      case CommandValidatorEnum.RENEW:
        console.log(CommandValidatorEnum.RENEW)
        result = await renewCommandHandler({
          fromUrl,
          domainName,
          domainStore,
          walletStore,
          rootStore,
          setProcessStatus,
        })
        break
      case CommandValidatorEnum.WRAP:
        console.log(CommandValidatorEnum.WRAP)
        result = await domainWrapperHandler({
          fromUrl,
          domainName,
          rootStore,
          walletAddress: walletStore.walletAddress,
          setProcessStatus,
        })
        break
      case CommandValidatorEnum.TRANSFER:
        console.log(CommandValidatorEnum.TRANSFER)
        result = await transferDomainHandler({
          fromUrl,
          domainName,
          rootStore,
          transferTo: command.address,
          walletAddress: walletStore.walletAddress,
          setProcessStatus,
        })
        result && domainStore.loadDomainRecord(domainName)
        break
      case CommandValidatorEnum.NOTION:
        console.log('NOTION', command)
        if (
          command.url.includes('notion') &&
          !command.url.includes('substack')
        ) {
          result = await addNotionPageHandler({
            command,
            domainName,
            domainStore,
            rootStore,
            navigate,
            setProcessStatus,
          })
          console.log(result)
          console.log(CommandValidatorEnum.NOTION, command)
        }
        if (
          command.url.includes('substack') &&
          !command.url.includes('notion')
        ) {
          result = await addSubstackPageHandler({
            command,
            domainName,
            domainStore,
            rootStore,
            navigate,
            setProcessStatus,
          })
          console.log(result)
          console.log(CommandValidatorEnum.NOTION, command)
        }
        break
      default:
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: 'Invalid input',
        })
    }
    if (result) {
      resetInput()
    }
    resetProcessStatus(10000)
    setLoading(false)
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
      widgets: [widget],
      domainName,
      nameSpace: subPage,
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
            placeholder={'Enter any URL, your email or Notion site'}
            value={formFields.widgetValue}
            onSearch={onChange}
            onKeyDown={enterHandler}
          />
          {/* {checkIsActivated && !widgetListStore.isActivated && (
            <Box pad={{ top: '0.5em' }}>
              <SmallText>
                Your first transaction when trying to add a post is an
                activation transaction, which is followed by an addition
                transaction. Approval for both transactions are required to add
                a post.
              </SmallText>
            </Box>
          )} */}

          {processStatus.type !== ProcessStatusTypes.IDLE && (
            <Box align={'center'} margin={{ top: '8px' }}>
              <ProcessStatus status={processStatus} />
            </Box>
          )}
        </WidgetInputContainer>
      )}

      {!isTelegramMode &&
        widgetListStore.widgetList.map((widget, index) => (
          <WidgetStatusWrapper
            key={widget.id + widget.value + +widget.isPinned}
            loaderId={widgetListStore.buildWidgetLoaderId(widget.id)}
          >
            <MediaWidget
              domainName={domainName}
              value={widget.value}
              type={widget.type}
              uuid={widget.uuid}
              isPinned={widget.isPinned}
              isOwner={domainStore.isOwner}
              onDelete={() => deleteWidget(widget)}
              onPin={(isPinned: boolean) => pinWidget(widget, isPinned)}
            />
          </WidgetStatusWrapper>
        ))}

      {!isTelegramMode && domainStore.domainRecord && (
        <TransactionWidget name={domainName} />
      )}
      {!isTelegramMode &&
        !domainStore.isExpired &&
        domainName.length <= 3 &&
        walletStore.isConnected &&
        domainStore.isOwner && (
          <Box direction={'row'} gap={'4px'} justify={'start'} align={'center'}>
            <Text
              size={'small'}
              // weight={'bold'}
              style={{ whiteSpace: 'nowrap' }}
            >
              Join Telegram Group
              <a
                href="https://t.me/+RQf_CIiLL3ZiOTYx"
                target="_blank"
                style={{ textDecoration: 'none' }}
              >
                {' '}
                1.country 3-character club
              </a>
            </Text>
          </Box>
        )}
      <FlexRow>
        {!walletStore.isConnected && walletStore.isMetamaskAvailable && (
          <MetamaskWidget />
        )}
        <WalletConnectWidget />
      </FlexRow>
    </PageWidgetContainer>
  )
})
