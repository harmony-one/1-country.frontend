import React, { useEffect, useState } from 'react'
import { DomainStore } from '../../stores/DomainStore'
import { EmojiButton } from './EmojiSection.styles'
import appConfig from '../../../config'
import { palette } from '../../constants'
import { ProcessStatusTypes } from '../process-status/ProcessStatus'
import { sleep } from '../../utils/sleep'
import { useStores } from '../../stores'
import { modalStore } from '../../modules/modals/ModalContext'
import { ModalIds } from '../../modules/modals'
import { usePrepareSendTransaction, useSendTransaction } from 'wagmi'
import Web3 from 'web3'
import { FlexRow } from '../Layout'
import { BaseText } from '../Text'
import { LinkWrapper } from '../Controls'
import { cutString } from '../../utils/string'

export interface TipProps {
  isFixed: boolean
  fixedAmount: number
}

export enum EmojiEnumType {
  TIP,
  EMAIL,
}

interface Props {
  type: EmojiEnumType
  domainStore?: DomainStore
  icon: any
  setProcessStatus?: any
  tip?: TipProps
  iconColor?: string
  setIsProcessing?: any
  isProcessing?: boolean
}

const Emoji: React.FC<Props> = ({
  type = EmojiEnumType.TIP,
  domainStore,
  icon,
  iconColor = palette.Purple,
  setProcessStatus,
  setIsProcessing,
  isProcessing,
  tip,
}) => {
  const [counter, setCounter] = useState(0)
  const { walletStore } = useStores()
  const { isFixed, fixedAmount } = tip
  const [buttonClicked, setButtonClicked] = useState(false)
  const isTipping = type === EmojiEnumType.TIP

  useEffect(() => {
    if (type === EmojiEnumType.TIP) {
      // fetch counter
    }
  }, [])

  const closeAfterSuccess = async (timer = 5000) => {
    await sleep(timer)
    setIsProcessing(false)
    setButtonClicked(false)
    setProcessStatus({
      type: ProcessStatusTypes.IDLE,
      render: '',
    })
  }

  const { config } =
    isTipping &&
    usePrepareSendTransaction({
      request: {
        to: domainStore.domainRecord.renter,
        value: fixedAmount
          ? Web3.utils.toBN(Web3.utils.toWei(fixedAmount + '')).toString()
          : undefined,
      },
    })

  const { data, isSuccess, status, error, sendTransaction } =
    isTipping && useSendTransaction(config)

  const tipActionButton = async () => {
    if (walletStore.isConnected) {
      if (walletStore.walletAddress !== domainStore.domainRecord.renter) {
        if (!isFixed) {
          modalStore.showModal(ModalIds.TIP_PAGE)
        } else {
          sendTransaction && sendTransaction()
          setProcessStatus({
            type: ProcessStatusTypes.PROGRESS,
            render: 'Processing transaction',
          })
        }
      } else {
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: 'Origin and destination addresses are the same',
        })
        closeAfterSuccess(2000)
      }
    } else {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: 'Connect your wallet and try again',
      })
      closeAfterSuccess(1500)
      walletStore.isMetamaskAvailable ? walletStore.connect() : open()
    }
  }

  useEffect(() => {
    if (error) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: error.message,
      })
      closeAfterSuccess(2500)
      return
    }
    if (isSuccess) {
      setProcessStatus({
        type: ProcessStatusTypes.SUCCESS,
        render: (
          <FlexRow>
            <BaseText style={{ marginRight: 8 }}>Success</BaseText>(
            <LinkWrapper
              target="_blank"
              type="text"
              href={`${appConfig.explorer.explorerUrl}${data?.hash}`}
            >
              <BaseText>{cutString(data?.hash)}</BaseText>
            </LinkWrapper>
            )
          </FlexRow>
        ),
      })
      setCounter(counter + 1)
      closeAfterSuccess()
      return
    }
  }, [status])

  const actionButton = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setButtonClicked(true)
    if (isTipping) {
      setIsProcessing(true)
      tipActionButton()
    }
  }

  return (
    <EmojiButton
      onClick={actionButton}
      isProcessing={isProcessing && buttonClicked}
      iconColor={iconColor}
      disabled={isProcessing}
    >
      {icon}
      {counter > 0 && <span>{counter}</span>}
    </EmojiButton>
  )
}

export default Emoji
