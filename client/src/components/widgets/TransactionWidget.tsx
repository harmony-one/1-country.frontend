import React from 'react'
import styled from 'styled-components'
import { Box } from 'grommet/components/Box'
import { Spinner } from 'grommet/components/Spinner'
import { Tip } from 'grommet/components/Tip'
import Timer from '@amplication/react-compound-timer'
import { BaseText } from '../Text'
import { DomainRecord } from '../../api'
import { HarmonyLink } from '../HarmonyLink'
import { WidgetsContainer } from './Widgets.styles'
import { buildTxUri } from '../../utils/explorer'

const Container = styled(WidgetsContainer)`
  border: 1px solid rgb(207, 217, 222);
  border-radius: 12px;
  padding: 12px;
  box-sizing: border-box;
  cursor: ${(props) => (props.onClick ? 'pointer' : undefined)};
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

const TipContent: React.FC<{ text: string }> = ({ text }) => {
  return (
    <Box
      animation="fadeIn"
      align="center"
      border
      margin={{ horizontal: '8px' }}
      round="12px"
      pad={{ horizontal: '16px', vertical: '8px' }}
      background="white"
    >
      <BaseText>{text}</BaseText>
    </Box>
  )
}

export const TransactionWidget: React.FC<Props> = ({
  loading,
  name,
  txHash,
  domainRecord,
}) => {
  const handleClick = () => {
    window.open(buildTxUri(txHash), '_blank')
  }

  const tipContent = `Rented on: ${dateFormat.format(
    domainRecord.rentTime
  )} and Rented until: ${dateFormat.format(domainRecord.expirationTime)}`

  return (
    <Container onClick={txHash ? handleClick : undefined}>
      <Box gap="4px" align="center">
        {/* <BaseText>{name}.country</BaseText> */}
        {/* <BaseText>
          Rented on: {dateFormat.format(domainRecord.rentTime)}{' '}
        </BaseText>
        <BaseText>

        </BaseText> */}
        <Tip
          plain
          // content={<TipContent text={tipContent} />}
          // dropProps={{ align: { bottom: 'top' } }}
        >
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
        </Tip>
        {loading && <Spinner color="#00AEEA" />}
        {!loading && txHash && <HarmonyLink type="tx" hash={txHash} />}
      </Box>
    </Container>
  )
}
