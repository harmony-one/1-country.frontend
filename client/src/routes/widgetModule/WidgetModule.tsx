import React, { useEffect, useState } from 'react'
import { useWeb3Modal } from '@web3modal/react'
import isValidUrl from 'is-url'
import axios from 'axios'

import { rootStore, useStores } from '../../stores'
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
import {
  // addNotionPageCommand,
  addNotionPageHandler,
} from '../../utils/command-handler/NotionCommandHandler'
import { useNavigate } from 'react-router'
import { mainApi } from '../../api/mainApi'
import { getElementAttributes } from '../../utils/getElAttributes'

import { SearchInput } from '../../components/search-input/SearchInput'
import { MediaWidget } from '../../components/widgets/MediaWidget'
import { loadEmbedJson } from '../../modules/embedly/embedly'
import {
  isEmail,
  isEmailId,
  isIframeWidget,
  isRedditUrl,
  isStakingWidgetUrl,
} from '../../utils/validation'
import { BaseText, SmallText } from '../../components/Text'
import { Box } from 'grommet/components/Box'
import { Text } from 'grommet'
///
import { ethers } from 'ethers'
import { easServerClient } from '../../api/eas/easServerClient'
import { getEthersError } from '../../api/utils'
import { FlexColumn } from '../../components/Layout'
import { addPostHandler } from '../../utils/command-handler/PostCommandHandler'
///

function parseEmailInput(str: string): false | [string, string] {
  const input = str.trim()
  if (input.indexOf('email:') === 0) {
    return parseEmailInput(input.split('email:')[1])
  }

  if (input.indexOf('=') !== -1) {
    return parseEmailInput(input.replace('=', ' '))
  }

  if (isEmail(input)) {
    return ['hello', input]
  }

  const [part1, part2] = input.split(' ')

  if (!isEmail(part1) && isEmailId(part1) && isEmail(part2)) {
    return [part1, part2]
  }

  if (isEmail(part1) && isEmail(part2)) {
    const name = part1.split('@')[0]
    return [name, part2]
  }

  return false
}

const defaultFormFields = {
  widgetValue: '',
}

interface Props {
  domainName: string
}

export const WidgetModule: React.FC<Props> = observer(({ domainName }) => {
  const { domainStore, walletStore, utilsStore, rootStore } = useStores()
  const navigate = useNavigate()
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

  const createAlias = async (alias: string, forward: string) => {
    setProcessStatus({
      type: ProcessStatusTypes.PROGRESS,
      render: (
        <BaseText>
          {walletStore.isMetamaskAvailable
            ? 'Waiting for a transaction to be signed'
            : 'Sign transaction on mobile device'}
        </BaseText>
      ),
    })

    try {
      const numAlias = await rootStore.easClient.getNumAlias(domainName)
      const maxAlias = await rootStore.easClient.maxNumAlias()
      const publicAliases = await rootStore.easClient.getPublicAliases(
        domainName
      )
      console.log('### maxNum', numAlias)
      console.log('### numAlias', numAlias)
      console.log('### publicAliases', publicAliases)

      if (numAlias >= maxAlias) {
        setProcessStatus({
          type: ProcessStatusTypes.PROGRESS,
          render: (
            <BaseText>
              {walletStore.isMetamaskAvailable
                ? 'Waiting for a transaction to be signed'
                : 'Sign transaction on mobile device'}
            </BaseText>
          ),
        })

        const removingAlias = publicAliases[0]

        setProcessStatus({
          type: ProcessStatusTypes.PROGRESS,
          render: <BaseText>Removing old alias: {removingAlias}</BaseText>,
        })

        const delResult = await rootStore.easClient.deactivateAll({
          domainName,
          onTransactionHash: () => {
            setProcessStatus({
              type: ProcessStatusTypes.PROGRESS,
              render: <BaseText>Waiting for transaction confirmation</BaseText>,
            })
          },
        })

        if (delResult.error) {
          const message = getEthersError(delResult.error) || 'Please contact us'
          setProcessStatus({
            type: ProcessStatusTypes.ERROR,
            render: <BaseText>Deactivation failed. {message}</BaseText>,
          })
          return
        }
      }

      const signature = await rootStore.easClient.buildSignature(
        domainName,
        alias,
        forward
      )
      const separator = ethers.utils.toUtf8Bytes(
        await rootStore.easClient.getSeparator()
      )
      const data = ethers.utils.concat([
        ethers.utils.toUtf8Bytes(alias),
        separator,
        ethers.utils.toUtf8Bytes(forward),
        separator,
        signature,
      ])
      let makePublic = true
      const commitment = ethers.utils.keccak256(data)

      console.log('### publicAliases', publicAliases)

      if (publicAliases.includes(alias)) {
        makePublic = false
      }

      setProcessStatus({
        type: ProcessStatusTypes.PROGRESS,
        render: (
          <BaseText>
            {walletStore.isMetamaskAvailable
              ? 'Waiting for a transaction to be signed'
              : 'Sign transaction on mobile device'}
          </BaseText>
        ),
      })

      const activateResult = await rootStore.easClient.activate({
        domainName: domainName,
        onTransactionHash: () => {
          setProcessStatus({
            type: ProcessStatusTypes.PROGRESS,
            render: <BaseText>Waiting for transaction confirmation</BaseText>,
          })
        },
        alias,
        commitment,
        makePublic,
      })

      if (activateResult.error) {
        const message =
          getEthersError(activateResult.error) || 'Please contact us'
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: <BaseText>Activation failed. {message}</BaseText>,
        })
        return
      }

      setProcessStatus({
        type: ProcessStatusTypes.PROGRESS,
        render: 'Adding email alias',
      })

      const { success, error } = await easServerClient.activate(
        domainName,
        alias,
        forward,
        signature
      )

      if (error) {
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: (
            <BaseText>{`Activation failed. ${
              error
                ? `Error: ${error}`
                : 'Please email dot-country@hiddenstate.xyz for futher support'
            }`}</BaseText>
          ),
        })
        return
      }

      if (success) {
        setProcessStatus({
          type: ProcessStatusTypes.SUCCESS,
          render: 'Activation complete!',
        })
      }
    } catch (ex) {
      console.log('### ex', ex)

      let errorMessage = getEthersError(ex)

      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: (
          <BaseText>{`Activation failed. ${
            ex
              ? `Error: ${errorMessage}`
              : 'Please email dot-country@hiddenstate.xyz for futher support'
          }`}</BaseText>
        ),
      })
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
    resetProcessStatus(10000)
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
      resetProcessStatus(10000)
      setLoading(false)
    } catch (error) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: (
          <BaseText>{`Error while renewing ${domainName}${config.tld}`}</BaseText>
        ),
      })
      console.log(error)
      resetProcessStatus(10000)
      setLoading(false)
    }
  }

  const commandHandler = async (text: string, fromUrl = false) => {
    const command = commandValidator(text)
    let result = false
    setLoading(true)
    switch (command.type) {
      case CommandValidatorEnum.VANITY:
        console.log(CommandValidatorEnum.VANITY)
        vanityHandler(command)
        break
      case CommandValidatorEnum.EMAIL_ALIAS:
        // works with value => email and value => aliasName=email
        console.log(CommandValidatorEnum.EMAIL_ALIAS, command)
        result = true
        window.open(`mailto:1country@harmony.one`, '_self')
        break
      case CommandValidatorEnum.URL:
      case CommandValidatorEnum.STAKING:
      case CommandValidatorEnum.IFRAME:
        result = await addPostHandler({
          url: command.url,
          fromUrl,
          domainName,
          walletStore,
          widgetListStore,
          setProcessStatus,
        })
        break
      case CommandValidatorEnum.RENEW:
        console.log(CommandValidatorEnum.RENEW)
        renewCommandHandler()
        break
      case CommandValidatorEnum.TRANSFER:
        console.log(CommandValidatorEnum.TRANSFER)
        //renewCommandHandler()
        break
      case CommandValidatorEnum.NOTION:
        console.log('here i am')
        result = await addNotionPageHandler({
          command,
          domainName,
          domainStore,
          rootStore,
          navigate,
          setProcessStatus,
        })
        console.log(CommandValidatorEnum.NOTION, command)
        // renewCommandHandler()
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
    console.log('HERE AT command handler')
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

    const aliasResult = parseEmailInput(value)

    if (aliasResult) {
      createAlias(aliasResult[0], aliasResult[1])
      return
    }

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
            type={widget.type}
            uuid={widget.uuid}
            isPinned={widget.isPinned}
            isOwner={domainStore.isOwner}
            onDelete={() => deleteWidget(widget)}
            onPin={(isPinned: boolean) => pinWidget(widget, isPinned)}
          />
        </WidgetStatusWrapper>
      ))}

      {domainStore.domainRecord && <TransactionWidget name={domainName} />}
      {!domainStore.isExpired &&
        domainName.length <= 3 &&
        walletStore.isConnected &&
        domainStore.isOwner && (
          <Box direction={'row'} gap={'4px'} justify={'start'} align={'center'}>
            <Text
              size={'small'}
              // weight={'bold'}
              style={{ whiteSpace: 'nowrap' }}
            >
              <a
                href="https://t.me/+RQf_CIiLL3ZiOTYx"
                target="_blank"
                style={{ textDecoration: 'none' }}
              >
                Join the 1.country 3-character club
              </a>
            </Text>
          </Box>
        )}
      <FlexColumn>
        {!walletStore.isConnected && walletStore.isMetamaskAvailable && (
          <MetamaskWidget />
        )}
        <WalletConnectWidget />
      </FlexColumn>
    </PageWidgetContainer>
  )
})
