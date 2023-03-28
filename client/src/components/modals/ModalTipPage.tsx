import React, { Dispatch, SetStateAction } from 'react'
import { observer } from 'mobx-react-lite'
import { ModalContent } from './ModalContent'
import { Title } from '../Text'
import { CancelButton, Button } from '../Controls'
import { Row } from '../Layout'

interface Props {
  onClose?: () => void
}

export const ModalTipPage: React.FC<Props> = observer(({ onClose }) => {
  return (
    <ModalContent>
      <Title>Tip this page</Title>
      <div style={{ overflowY: 'auto', marginBottom: '1em' }}>Tip form</div>

      <Row style={{ justifyContent: 'space-between' }}>
        <CancelButton
          type="submit"
          onClick={() => {
            onClose()
          }}
        >
          Cancel
        </CancelButton>
        <Button
          type="submit"
          onClick={() => {
            onClose()
          }}
        >
          I agree
        </Button>
      </Row>
    </ModalContent>
  )
})
