import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { usePrepareSendTransaction, useSendTransaction } from 'wagmi'
import Web3 from 'web3'

import {
  ProcessStatus,
  ProcessStatusItem,
  ProcessStatusTypes,
} from '../process-status/ProcessStatus'
import { cutString } from '../../utils/string'
import { DomainLevel } from '../../api/utils'
import appConfig from '../../../config'

import { ModalContent } from './ModalContent'
import { CancelButton, Button, LinkWrapper } from '../Controls'
import { FlexColumn, FlexRow, Row } from '../Layout'
import { DomainName, BaseText, Title } from '../Text'
import { SearchInput } from '../search-input/SearchInput'
import { sleep } from '../../utils/sleep'
import CurrencyInput from '../CurrencyInput/CurrencyInput'
interface Props {
  onClose?: () => void
  domainName: string
  ownerAddress: string
  domainLevel: DomainLevel
}

export const ModalTipPage: React.FC<Props> = observer(
  ({ onClose, domainName, ownerAddress, domainLevel }) => {
    const [amount, setAmount] = useState('')
    const [processStatus, setProcessStatus] = useState<ProcessStatusItem>({
      type: ProcessStatusTypes.IDLE,
      render: '',
    })
    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target
      setAmount(value)
    }

    const { config } = usePrepareSendTransaction({
      request: {
        to: ownerAddress ? ownerAddress : undefined,
        value: amount
          ? Web3.utils
              .toBN(Web3.utils.toWei(amount.replace(/[ ,.\b]ONE\b/, '')))
              .toString()
          : undefined,
      },
    })

    const { data, isSuccess, status, error, sendTransaction } =
      useSendTransaction(config)

    useEffect(() => {
      const closeAfterSuccess = async () => {
        await sleep(10000)
        onClose()
      }

      if (error) {
        setProcessStatus({
          type: ProcessStatusTypes.ERROR,
          render: error.message,
        })
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
        closeAfterSuccess()
        return
      }
    }, [status])

    const formSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      sendTransaction && sendTransaction()
      setProcessStatus({
        type: ProcessStatusTypes.PROGRESS,
        render: 'processing transaction',
      })
    }

    return (
      <ModalContent>
        {/* <Title>P2P Transfer</Title> */}
        <div style={{ overflowY: 'auto' }} />
        <form onSubmit={formSubmit}>
          <FlexColumn style={{ textAlign: 'center', alignItems: 'center' }}>
            <BaseText style={{ fontSize: '1rem' }}>Tipping</BaseText>
            <DomainName
              level={domainLevel}
              style={{ fontSize: '1rem', marginBottom: '1.5em' }}
            >
              {domainName}
            </DomainName>
            <CurrencyInput
              name="amount"
              type="text"
              required
              onChange={onChange}
              placeholder="0 ONE"
              value={amount}
            />
            {processStatus.type !== ProcessStatusTypes.IDLE && (
              <span
                style={{ fontSize: '0.9rem !important', paddingTop: '0.7em' }}
              >
                <ProcessStatus status={processStatus} />
              </span>
            )}
            <Row
              style={{ justifyContent: 'space-between', marginTop: '1.5em' }}
            >
              <CancelButton
                disabled={status === 'loading'}
                onClick={() => {
                  onClose()
                }}
              >
                {`${status === 'idle' ? 'Cancel' : 'Close'}`}
              </CancelButton>
              <Button type="submit" disabled={status === 'loading'}>
                Tip
              </Button>
            </Row>
          </FlexColumn>
        </form>
      </ModalContent>
    )
  }
)
