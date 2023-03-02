import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import humanizeDuration from 'humanize-duration'
import { Row } from '../../../components/Layout'
import { Button } from '../../../components/Controls'
import { HomeLabel, RecordRenewalContainer } from '../Home.styles'
import { BaseText, SmallTextGrey, Title } from '../../../components/Text'
import { useStores } from '../../../stores'
import { UITx } from '../../../modules/transactions/UITx'

interface Props {}

const humanD = humanizeDuration.humanizer({ round: true, largest: 1 })

export const DomainRecordRenewal: React.FC<Props> = observer(() => {
  const { domainStore, walletStore, rootStore, uiTransactionStore } =
    useStores()
  const [uiTx] = useState(uiTransactionStore.create())

  const handleRenewal = async () => {
    if (!walletStore.isHarmonyNetwork || !walletStore.isConnected) {
      await walletStore.connect()
    }

    uiTx.setStatusProgress()

    try {
      uiTx.setStatusWaitingSignIn()
      rootStore.d1dcClient.renewDomain({
        name: domainStore.domainName,
        url: '',
        amount: domainStore.domainPrice.amount,
        onTransactionHash: (txHash) => {
          uiTx.setTxHash(txHash)
          uiTx.setStatusProgress()
        },
        onFailed: (ex: Error) => {
          uiTx.setStatusFail(ex)
        },
        onSuccess: ({ transactionHash }) => {
          uiTx.setStatusSuccess()
        },
      })
    } catch (ex) {
      console.error(ex)
      uiTx.setStatusFail(ex)
    }
  }

  return (
    <RecordRenewalContainer>
      <Title style={{ marginTop: 16 }}>Renew ownership</Title>
      <Row style={{ justifyContent: 'center' }}>
        <HomeLabel>renewal price</HomeLabel>
        <BaseText>{domainStore.domainPrice.formatted} ONE</BaseText>
      </Row>
      <SmallTextGrey>
        for {humanD(domainStore.d1cParams.duration)}{' '}
      </SmallTextGrey>
      <Button onClick={handleRenewal} disabled={uiTx.pending}>
        RENEW
      </Button>
      <UITx uiTx={uiTx} />
    </RecordRenewalContainer>
  )
})
