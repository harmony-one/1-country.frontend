import React from 'react'
import { observer } from 'mobx-react-lite'
import { uiTransactionStore } from './UITransactionStore'
import { UITransactionStatus } from './UITransaction'
import { Box } from 'grommet/components/Box'
import { Spinner } from 'grommet/components/Spinner'
import { BaseText } from '../../components/Text'
import { HarmonyLink } from '../../components/HarmonyLink'
import { ModalHeader } from '../../components/modals/ModalHeader'
import { ModalRenderProps } from '../modals'

interface UITxModalContentProps {
  txHash: string
  status: UITransactionStatus
  errorMessage: string
  harmonyErrTxId?: string
}

export const UITxModalContent: React.FC<UITxModalContentProps> = ({
  txHash = '',
  status,
  errorMessage,
  harmonyErrTxId = '',
}) => {
  return (
    <Box align="center" gap="small">
      {status !== UITransactionStatus.FAIL && (
        <Box align="center">
          <Spinner />
        </Box>
      )}
      {txHash && (
        <Box direction="column">
          <BaseText>Transaction:</BaseText>
          <HarmonyLink cut={false} hash={txHash} type="tx" />
        </Box>
      )}

      {errorMessage && (
        <Box align="center">
          <BaseText>{errorMessage}</BaseText>
        </Box>
      )}
      {harmonyErrTxId && (
        <Box direction="row">
          <BaseText>Transaction:</BaseText>
          <HarmonyLink hash={txHash} type="tx" />
        </Box>
      )}
    </Box>
  )
}

interface Props extends ModalRenderProps {}

export const UITransactionModal: React.FC<Props> = observer((props) => {
  const { onClose } = props

  if (!uiTransactionStore.activeTx) {
    return null
  }

  return (
    <Box pad={{ horizontal: 'medium', vertical: 'medium' }} gap="small">
      <ModalHeader
        title={uiTransactionStore.activeTx.title}
        onClick={onClose}
      />
      <UITxModalContent
        txHash={uiTransactionStore.activeTx.txHash}
        status={uiTransactionStore.activeTx.status}
        errorMessage={uiTransactionStore.activeTx.errorMessage}
        harmonyErrTxId={uiTransactionStore.activeTx.harmonyErrTxId}
      />
    </Box>
  )
})
