import React from 'react'
import styled from 'styled-components'
import { Box, Spinner, Tip, Text } from 'grommet'
import Timer from '@amplication/react-compound-timer'
import { BaseText } from '../Text'
import { DomainRecord } from '../../api'
import {HarmonyLink} from '../HarmonyLink'
import { WidgetsContainer } from './Widgets.styles'

const Container = styled(WidgetsContainer)`
  flex-direction: row;
  border: 1px solid rgb(207, 217, 222);
  border-radius: 12px;
  padding: 12px;
  box-sizing: border-box;
  cursor: ${(props) => (props.onClick ? 'pointer' : undefined)};
  color: rgb(83, 100, 113);
  overflow: hidden;
`

const dateFormat = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

interface Props {
  isLoading: boolean
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

const LinkItem = styled.a`
  color: #47b8eb;
  font-size: 14px;
`

export const TransactionWidget: React.FC<Props> = ({
  isLoading,
  name,
  txHash,
  domainRecord,
}) => {
  const { renter, expirationTime, rentTime } = domainRecord

  return <Container style={{ padding: 0 }}>
    <Box justify={'center'}>
      <Box align={'start'} pad={'12px'} justify={'center'} background={'#00aee9'} style={{ width: '100%', height: '100%' }}>
        <Text weight={700} color={'white'} size={'20px'}>
          Harmony
        </Text>
        <Text weight={700} color={'white'} size={'14px'} style={{ whiteSpace: 'nowrap' }}>
          Block Explorer
        </Text>
      </Box>
    </Box>
    <Box gap={'4px'} pad={{ left: '4px', top: '12px', bottom: '12px' }}>
      <Box direction={'row'} gap={'4px'} justify={"start"} align={'center'}>
        <Text size={'small'} weight={'bold'}>Owner:</Text>
        <LinkItem href={`https://explorer.harmony.one/address/${renter}`} target={'_blank'}>{renter}</LinkItem>
      </Box>
      <Box direction={'row'} gap={'4px'} justify={"start"} align={'center'}>
        <Text size={'small'} weight={'bold'}>Expires in:</Text>
        <Text size={'small'}>
          <Timer
            formatValue={formatTime}
            initialTime={domainRecord.expirationTime - Date.now()}
            direction="backward"
          >
            <Timer.Days /> days, <Timer.Hours /> hours, <Timer.Minutes /> minutes
          </Timer>
        </Text>
      </Box>
      <Box direction={'row'} gap={'4px'} justify={"start"} align={'center'}>
        <Text size={'small'} weight={'bold'}>Rented until:</Text>
        <Text size={'small'}>{dateFormat.format(expirationTime)}</Text>
      </Box>
      <Box direction={'row'} gap={'4px'} justify={"start"} align={'center'}>
        {isLoading
          ? <Box direction={'row'} align={'center'} gap={'8px'}>
            <Spinner size={'xsmall'} color="#00AEEA" />
            <Text size={'small'}>Loading transaction data</Text>
          </Box>
          : <HarmonyLink
              type={'tx'}
              hash={txHash}
              href={`https://explorer.harmony.one/tx/${txHash}`}
            />
        }
      </Box>
    </Box>
  </Container>
}
