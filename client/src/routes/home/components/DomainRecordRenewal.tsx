import React, { useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import humanizeDuration from 'humanize-duration'
import { FlexRow, Row } from '../../../components/Layout'
import { Button, LinkWrarpper } from '../../../components/Controls'
import { HomeLabel, RecordRenewalContainer } from '../Home.styles'
import { BaseText, SmallTextGrey, Title } from '../../../components/Text'
import { useStores } from '../../../stores'
import { toast } from 'react-toastify'
import { Transaction } from '../../../api'

interface Props {}

const humanD = humanizeDuration.humanizer({ round: true, largest: 1 })

export const DomainRecordRenewal: React.FC<Props> = observer(() => {
  const { domainStore, walletStore, rootStore } = useStores()
  const client = rootStore.d1dcClient
  const [pending, setPending] = useState(false)
  const toastId = useRef(null)
  const [url] = useState(
    'https://twitter.com/harmonyprotocol/status/1619034491280039937?s=20&t=0cZ38hFKKOrnEaQAgKddOg'
  )

  const handleRenewal = async () => {
    if (!url) {
      return toast.error('Invalid URL to embed')
    }

    if (!walletStore.isHarmonyNetwork || !walletStore.isConnected) {
      await walletStore.connect()
    }

    setPending(true)
    try {
      const onFailed = () => {
        toast.update(toastId.current, {
          render: 'Failed to purchase',
          type: 'error',
          isLoading: false,
          autoClose: 2000,
        })
      }

      const onSuccess = (tx: Transaction) => {
        console.log(tx)
        const { transactionHash } = tx
        toast.update(toastId.current, {
          render: (
            <FlexRow>
              <BaseText style={{ marginRight: 8 }}>Done!</BaseText>
              <LinkWrarpper
                target="_blank"
                href={client.getExplorerUri(transactionHash)}
              >
                <BaseText>View transaction</BaseText>
              </LinkWrarpper>
            </FlexRow>
          ),
          type: 'success',
          isLoading: false,
          autoClose: 2000,
        })
        setTimeout(() => location.reload(), 1500)
      }

      toastId.current = toast.loading('Processing transaction')

      rootStore.d1dcClient.updateURL({
        name: domainStore.domainName,
        url: '',
        onFailed: onFailed,
        onSuccess: onSuccess,
      })
    } catch (ex) {
      console.error(ex)
      toast.error(`Unexpected error: ${ex.toString()}`)
    } finally {
      setPending(false)
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
      <Button onClick={handleRenewal} disabled={pending}>
        RENEW
      </Button>
    </RecordRenewalContainer>
  )
})
