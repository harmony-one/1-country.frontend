import React, { useEffect, useState } from 'react'
import { AiFillHeart } from 'react-icons/ai'
import appConfig from '../../../config'
import { ModalIds, ModalRegister } from '../../modules/modals'
import { DomainStore } from '../../stores/DomainStore'
import { ModalTipPage } from '../modals/ModalTipPage'
import { TipDomainPageContainer, TipPageButton } from './TipDomainPage.styles'
import { useStores } from '../../stores'
import { modalStore } from '../../modules/modals/ModalContext'
import { palette } from '../../constants'
import Web3 from 'web3'
import { usePrepareSendTransaction, useSendTransaction } from 'wagmi'
import {
  ProcessStatus,
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../process-status/ProcessStatus'
import { sleep } from '../../utils/sleep'
import { FlexRow } from '../Layout'
import { BaseText } from '../Text'
import { LinkWrapper } from '../Controls'
import { cutString } from '../../utils/string'

interface Props {
  domainStore: DomainStore
  isFixed: boolean
  fixedAmount?: number
}

const TipDomainPage: React.FC<Props> = ({
  isFixed = true,
  domainStore,
  fixedAmount = 100,
}) => {
  const { domainName } = domainStore
  const { walletStore } = useStores()
  const [counter, setCounter] = useState(100)
  const [processStatus, setProcessStatus] = useState<ProcessStatusItem>({
    type: ProcessStatusTypes.IDLE,
    render: '',
  })

  const { config } = usePrepareSendTransaction({
    request: {
      to: domainStore.domainRecord.renter,
      value: fixedAmount
        ? Web3.utils.toBN(Web3.utils.toWei(fixedAmount + '')).toString()
        : undefined,
    },
  })

  const { data, isSuccess, status, error, sendTransaction } =
    useSendTransaction(config)

  const closeAfterSuccess = async (timer = 5000) => {
    await sleep(timer)
    setProcessStatus({
      type: ProcessStatusTypes.IDLE,
      render: '',
    })
  }

  useEffect(() => {
    console.log('waiting for contract changes')
    // setCounter(0)
    // setCounter(0)
  }, [counter])

  useEffect(() => {
    if (error) {
      setProcessStatus({
        type: ProcessStatusTypes.ERROR,
        render: error.message,
      })
      closeAfterSuccess()
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

  const actionButton = async (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault()
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
  // disabled={processStatus.type !== ProcessStatusTypes.IDLE}
  return (
    <TipDomainPageContainer>
      <TipPageButton>
        <button onClick={actionButton}>
          <AiFillHeart
            style={{
              color: palette.Purple,
              verticalAlign: 'bottom',
              fontSize: '1.3rem',
              paddingLeft: '0.3em',
            }}
          />
          {counter > 0 && <span>{counter}</span>}
        </button>
      </TipPageButton>
      {processStatus.type !== ProcessStatusTypes.IDLE && (
        <span style={{ fontSize: '0.9rem !important', paddingTop: '0.1em' }}>
          <ProcessStatus status={processStatus} />
        </span>
      )}
      <ModalRegister
        layerProps={{ position: 'center', full: false }}
        modalId={ModalIds.TIP_PAGE}
      >
        {(modalProps) => (
          <ModalTipPage
            domainLevel="common" //{level}
            domainName={`${domainName}${appConfig.tld}`}
            ownerAddress={domainStore.domainRecord.renter}
            {...modalProps}
          />
        )}
      </ModalRegister>
    </TipDomainPageContainer>
  )
}

export default TipDomainPage
