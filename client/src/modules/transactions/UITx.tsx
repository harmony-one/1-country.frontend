import React from 'react'
import { Box } from 'grommet/components/Box'
import { UITransaction } from './UITransaction'
import { Spinner } from 'grommet/components/Spinner'
import { BaseText } from '../../components/Text'
import { HarmonyLink } from '../../components/HarmonyLink'
import { observer } from 'mobx-react-lite'

export const UITx: React.FC<{ uiTx: UITransaction }> = observer(({ uiTx }) => {
  return (
    <Box align="center" gap="small">
      <Box>
        <BaseText>{uiTx.title}</BaseText>
      </Box>

      {uiTx.pending && (
        <Box align="center">
          <Spinner />
        </Box>
      )}
      {uiTx.txHash && (
        <Box direction="column">
          <BaseText>Transaction:</BaseText>
          <HarmonyLink cut hash={uiTx.txHash} type="tx" />
        </Box>
      )}
      {uiTx.errorMessage && (
        <Box align="center">
          <BaseText>{uiTx.errorMessage}</BaseText>
        </Box>
      )}
      {uiTx.harmonyErrTxId && (
        <Box direction="row">
          <BaseText>Transaction:</BaseText>
          <HarmonyLink hash={uiTx.txHash} type="tx" />
        </Box>
      )}
    </Box>
  )
})
