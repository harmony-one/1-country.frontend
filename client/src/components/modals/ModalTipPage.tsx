import React, { ChangeEvent, FormEvent, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { usePrepareSendTransaction, useSendTransaction } from 'wagmi'
import Web3 from 'web3'

import { DomainLevel } from '../../api/utils'

import { ModalContent } from './ModalContent'
import { Title } from '../Text'
import { CancelButton, Button } from '../Controls'
import { FlexColumn, Row } from '../Layout'
import { DomainName } from '../Text'
import { SearchInput } from '../search-input/SearchInput'

interface Props {
  onClose?: () => void
  domainName: string
  ownerAddress: string
  domainLevel: DomainLevel
}

const defaultFormFields = {
  to: '',
  amount: '',
}

export const ModalTipPage: React.FC<Props> = observer(
  ({ onClose, domainName, ownerAddress, domainLevel }) => {
    const [amount, setAmount] = useState('')

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target
      setAmount(value)
    }

    const { config } = usePrepareSendTransaction({
      request: {
        to: ownerAddress ? ownerAddress : undefined,
        value: amount
          ? Web3.utils.toBN(Web3.utils.toWei(amount)).toString()
          : undefined,
      },
    })

    const { sendTransaction } = useSendTransaction(config)

    const formSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      sendTransaction && sendTransaction()
    }

    return (
      <ModalContent>
        <Title>P2P Transfer</Title>
        <div style={{ overflowY: 'auto' }} />
        <form onSubmit={formSubmit}>
          <FlexColumn style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '1rem' }}>
              You can tip the owner of this page
            </span>
            <DomainName
              level={domainLevel}
              style={{ fontSize: '1rem', marginBottom: '1.5em' }}
            >
              {domainName}
            </DomainName>
            <SearchInput
              name="amount"
              type="number"
              required
              onChange={onChange}
              placeholder="Please enter the amount (ONE)"
            />
            <Row
              style={{ justifyContent: 'space-between', marginTop: '1.5em' }}
            >
              <CancelButton
                type="submit"
                onClick={() => {
                  onClose()
                }}
              >
                Cancel
              </CancelButton>
              <Button type="submit">Tip</Button>
            </Row>
          </FlexColumn>
        </form>
      </ModalContent>
    )
  }
)
