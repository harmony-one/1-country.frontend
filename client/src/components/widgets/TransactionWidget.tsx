import React from 'react'
import styled from 'styled-components'
import { Box } from 'grommet/components/Box'
import { Text } from 'grommet/components/Text'
import Timer from '@amplication/react-compound-timer'
import { DomainRecord } from '../../api'
import { HarmonyLink } from '../HarmonyLink'
import { WidgetsContainer } from './Widgets.styles'
import { utils } from '../../api/utils'

const Container = styled(WidgetsContainer)`
  gap: 0;
  flex-direction: row;
  border: 1px solid rgb(207, 217, 222);
  border-radius: 12px;
  padding: 12px;
  box-sizing: border-box;
  cursor: ${(props) => (props.onClick ? 'pointer' : undefined)};
  color: rgb(83, 100, 113);
  overflow: hidden;
  min-width: 278px;
`

const dateFormat = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const ExplorerLogoContainer = styled(Box)`
  width: 100%;
  height: 100%;
  background-color: #00aee9;
`

const ExplorerLogoWrapper = styled(Box)`
  display: none;

  @media (min-width: 600px) {
    display: block;
  }
`

const formatTime = (value: number) => `${value < 10 ? `0${value}` : value}`

const LinkItem = styled.a`
  color: #47b8eb;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`

interface Props {
  name: string
  domainRecord: DomainRecord
}

export const TransactionWidget: React.FC<Props> = ({ name, domainRecord }) => {
  const { renter, expirationTime } = domainRecord

  const fullDomainName = name + '.country'
  const erc1155Uri = utils.buildDomainExplorerURI(fullDomainName)

  return (
    <Container style={{ padding: 0 }}>
      <ExplorerLogoWrapper justify={'center'}>
        <ExplorerLogoContainer align={'start'} pad={'12px'} justify={'center'}>
          <Text weight={700} color={'white'} size={'20px'}>
            Harmony
          </Text>
          <Text
            weight={700}
            color={'white'}
            size={'14px'}
            style={{ whiteSpace: 'nowrap' }}
          >
            Block Explorer
          </Text>
        </ExplorerLogoContainer>
      </ExplorerLogoWrapper>
      <Box gap={'6px'} pad={{ left: '14px', top: '12px', bottom: '12px' }}>
        <Box direction={'row'} gap={'4px'} justify={'start'} align={'center'}>
          <Text size={'small'} weight={'bold'}>
            Owner:
          </Text>
          <LinkItem
            href={`https://explorer.harmony.one/address/${renter}`}
            target={'_blank'}
          >
            {renter}
          </LinkItem>
        </Box>
        <Box direction={'row'} gap={'4px'} justify={'start'} align={'center'}>
          <Text size={'small'} weight={'bold'}>
            Rented until:
          </Text>
          <Text size={'small'}>{dateFormat.format(expirationTime)}</Text>
        </Box>
        <Box direction={'row'} gap={'4px'} justify={'start'} align={'center'}>
          <Text size={'small'} weight={'bold'} style={{ whiteSpace: 'nowrap' }}>
            Expires in:
          </Text>
          <Text size={'small'} style={{ whiteSpace: 'nowrap' }}>
            <Timer
              formatValue={formatTime}
              initialTime={domainRecord.expirationTime - Date.now()}
              direction="backward"
            >
              <Timer.Days /> days
              {domainRecord.expirationTime - Date.now() <
              1000 * 3600 * 24 * 7 ? (
                <span>
                  , <Timer.Hours /> hours, <Timer.Minutes /> min
                </span>
              ) : null}
            </Timer>
          </Text>
        </Box>
        <Box direction={'row'} gap={'4px'} justify={'start'} align={'center'}>
          <HarmonyLink
            type={'nft'}
            text={fullDomainName}
            href={erc1155Uri}
            hash={utils.buildTokenId(fullDomainName)}
          />
        </Box>
      </Box>
    </Container>
  )
}
