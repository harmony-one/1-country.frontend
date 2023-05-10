import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Box } from 'grommet/components/Box'
import { Text } from 'grommet/components/Text'
import Timer from '@amplication/react-compound-timer'
import { WidgetsContainer } from './Widgets.styles'
import { utils } from '../../api/utils'
import { useStores } from '../../stores'
import { observer } from 'mobx-react-lite'

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
  background-color: #ffffff;
`

const dateFormat = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const ExplorerLogoContainer = styled(Box)`
  width: 120px;
  height: 120px;
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
}

export const TransactionWidget: React.FC<Props> = observer(({ name }) => {
  const { domainStore } = useStores()
  const { domainRecord } = domainStore
  const { renter, expirationTime } = domainRecord
  const MILLISECONDS_IN_WEEK = 1000 * 3600 * 24 * 7
  const fullDomainName = name + '.country'
  const erc1155Uri = utils.buildDomainExplorerURI(fullDomainName)
  const timerRef = useRef(null)

  useEffect(() => {
    if (timerRef.current) {
      timerRef.current.setTime(expirationTime - Date.now())
    }
  }, [expirationTime])
  return (
    <Container style={{ padding: 0 }}>
      <ExplorerLogoWrapper justify={'center'}>
        <ExplorerLogoContainer align={'start'} justify={'center'}>
          <a href={erc1155Uri} target="_blank">
            <img
              width="100%"
              height="100%"
              alt="domain image"
              src={utils.buildDomainImageURI(fullDomainName)}
            />
          </a>
        </ExplorerLogoContainer>
      </ExplorerLogoWrapper>
      <Box
        gap={'6px'}
        justify={'center'}
        pad={{ left: '14px', top: '12px', bottom: '12px' }}
      >
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
        {!domainStore.isExpired ? (
          <Box direction={'row'} gap={'4px'} justify={'start'} align={'center'}>
            <Text
              size={'small'}
              weight={'bold'}
              style={{ whiteSpace: 'nowrap' }}
            >
              Expires in:
            </Text>
            <Text size={'small'} style={{ whiteSpace: 'nowrap' }}>
              <Timer
                formatValue={formatTime}
                // initialTime={expirationTime - Date.now()}
                direction="backward"
                ref={timerRef}
              >
                <Timer.Days /> days
                {expirationTime - Date.now() < MILLISECONDS_IN_WEEK ? (
                  <span>
                    , <Timer.Hours /> hours, <Timer.Minutes /> min
                  </span>
                ) : null}
              </Timer>
            </Text>
          </Box>
        ) : (
          <Box direction={'row'} gap={'4px'} justify={'start'} align={'center'}>
            <Text
              size={'small'}
              weight={'bold'}
              style={{ whiteSpace: 'nowrap' }}
            >
              Domain expired
            </Text>
          </Box>
        )}
        {!domainStore.isExpired && domainStore.domainName.length <= 3 && (
          <Box direction={'row'} gap={'4px'} justify={'start'} align={'center'}>
            <Text
              size={'small'}
              // weight={'bold'}
              style={{ whiteSpace: 'nowrap' }}
            >
              <a href="https://t.me/+RQf_CIiLL3ZiOTYx" target="_blank">
                Join the 1.country 3-character club!
              </a>
            </Text>
          </Box>
        )}
      </Box>
    </Container>
  )
})
