import React from 'react'
import styled from 'styled-components'
import { Box } from 'grommet/components/Box'
import { Spinner } from 'grommet/components/Spinner'
import Timer from '@amplication/react-compound-timer'
import { BaseText } from '../Text'
import { DomainRecord } from '../../api'
import { HarmonyLink } from '../HarmonyLink'
import { WidgetsContainer } from './Widgets.styles'

const Container = styled(WidgetsContainer)`
  border: 1px solid rgb(207, 217, 222);
  border-radius: 12px;
  padding: 12px;
  box-sizing: border-box;
`

const dateFormat = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

interface Props {
  loading: boolean
  txHash: string
  name: string
  domainRecord: DomainRecord
}

const formatTime = (value: number) => `${value < 10 ? `0${value}` : value}`

export const TransactionWidget: React.FC<Props> = ({
  loading,
  name,
  txHash,
  domainRecord,
}) => {
  return (
    <Container>
      <Box gap="4px" align="center">
        {/* <BaseText>{name}.country</BaseText> */}
        {/* <BaseText>
          Rented on: {dateFormat.format(domainRecord.rentTime)}{' '}
        </BaseText>
        <BaseText>
          Rented until: {dateFormat.format(domainRecord.expirationTime)}{' '}
        </BaseText> */}
        <BaseText>
          <Timer
            formatValue={formatTime}
            initialTime={domainRecord.expirationTime - Date.now()}
            direction="backward"
          >
            <Timer.Days />:
            <Timer.Hours />:
            <Timer.Minutes />:
            <Timer.Seconds />
          </Timer>
        </BaseText>
        {loading && <Spinner color="#00AEEA" />}
        {!loading && txHash && <HarmonyLink type="tx" hash={txHash} />}
      </Box>
    </Container>
  )
}
