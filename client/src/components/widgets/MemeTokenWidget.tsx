import React, { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { WidgetControls, WidgetsContainer } from './Widgets.styles'
import { CloseCircle } from '../icons/CloseCircle'
import { Box } from 'grommet/components/Box'
import { useStores } from '../../stores'
import { Token, TokenBalance, TokenWinner } from '../../api/meme-token/types'
import styled from 'styled-components'
import Decimal from 'decimal.js'

const TokenGrid = styled(Box)`
  display: grid;
  gap: 8px;
  width: 100%;
  margin: 0 auto;
  z-index: 2 !important;
  position: relative;

  &.three-columns {
    grid-template-columns: repeat(3, 1fr);
  }
  &.two-columns {
    grid-template-columns: repeat(2, 1fr);
  }
  &.one-column {
    grid-template-columns: 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr !important;
  }
`

const TokenList = styled(Box)`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 16px;
  min-height: 320px;
  width: 100%;
  display: flex;
  flex-direction: column;
`

const TokenListContent = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const TokenItem = styled(Box)`
  display: flex;
  flex-direction: column;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
`

const TokenImageBanner = styled.div`
  width: 100%;
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #f5f5f5;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const TokenTitle = styled.h3`
  margin: 0 0 16px 0;
  color: #333;
  font-size: 16px;
  text-align: center;
`

const TokenContent = styled(Box)`
  text-align: center;
`

const TokenName = styled.strong`
  font-size: 14px;
  color: #333;
  margin: 0;
  display: block;
`

const TokenSymbol = styled(Box)`
  font-size: 12px;
  color: #666;
`

const TokenMetric = styled(Box)`
  font-size: 12px;
  color: #333;
`
interface Props {
  isOwner?: boolean
  onDelete: () => void
}

export const MemeTokenWidget: React.FC<Props> = ({ isOwner, onDelete }) => {
  const { walletStore, rootStore } = useStores()
  const [isLoading, setLoading] = useState(true)
  const [holdTokens, setHoldTokens] = useState<TokenBalance[]>([])
  const [lastWinners, setLastWinners] = useState<TokenWinner[]>([])
  const [createdTokens, setCreatedTokens] = useState<Token[]>([])

  const memeTokenClient = rootStore.tokenApiClient

  const { ref, inView } = useInView({
    /* Optional options */
    rootMargin: '0px',
    root: null,
    triggerOnce: true,
    threshold: 0.1,
  })

  const getGridClass = () => {
    const nonEmptyLists = [
      createdTokens.length > 0,
      holdTokens.length > 0,
      lastWinners.length > 0,
    ].filter(Boolean).length

    switch (nonEmptyLists) {
      case 3:
        return 'three-columns'
      case 2:
        return 'two-columns'
      case 1:
        return 'one-column'
      default:
        return 'one-column'
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const [createdTokens, balances, lastwinners] = await Promise.all([
          memeTokenClient.getUserCreatedTokens(walletStore.walletAddress),
          memeTokenClient.getTokenBalances({
            userAddress: walletStore.walletAddress,
          }),
          memeTokenClient.getTokenWinners({ limit: 5, offset: 0 }),
        ])
        setCreatedTokens(createdTokens)
        setHoldTokens(balances) // holdTokensWithInfo)
        setLastWinners(lastwinners)
        setLoading(false)
      } catch (error) {
        console.error('Failed to load token data:', error)
      }
    }
    loadData()
  }, [])

  const formatBalance = (balance: string) => {
    return Number(balance) / 1e18 // Assuming 18 decimals
  }

  const formatMarketCap = (mc: string) => {
    const marketCap = new Decimal(mc)
    return marketCap.gt(0) ? marketCap.toFixed(4) : '0'
  }

  return (
    // <div>
    <WidgetsContainer isWidgetLoading={isLoading}>
      <Box pad={{ bottom: '2em' }}>
        <div
          style={{
            borderRadius: 12,
            border: '1px solid rgb(207,217,222)',
            padding: '20px',
            maxWidth: '100vw',
            width: 500,
          }}
        >
          <TokenGrid className={getGridClass()}>
            {createdTokens.length > 0 && (
              <TokenList>
                <TokenTitle>Coins Created</TokenTitle>
                <TokenListContent>
                  {createdTokens.slice(0, 3).map((token) => (
                    <TokenItem key={token.address}>
                      <TokenImageBanner>
                        <img src={token.uriData?.image} alt={token.name} />
                      </TokenImageBanner>
                      <TokenContent>
                        <TokenName>{token.name}</TokenName>
                        <TokenSymbol color="neutral-4">
                          {token.symbol}
                        </TokenSymbol>
                        <TokenMetric>
                          {' '}
                          {formatMarketCap(token.marketCap)} ONE
                        </TokenMetric>
                      </TokenContent>
                    </TokenItem>
                  ))}
                </TokenListContent>
              </TokenList>
            )}

            {holdTokens.length > 0 && (
              <TokenList>
                <TokenTitle>Coins Held</TokenTitle>
                <TokenListContent>
                  {holdTokens.slice(0, 3).map((hold, index) => (
                    <TokenItem key={index}>
                      <TokenImageBanner>
                        <img
                          src={hold.token.uriData?.image}
                          alt={hold.token.name}
                        />
                      </TokenImageBanner>
                      <TokenContent>
                        <TokenName>{hold.token.name}</TokenName>
                        <TokenSymbol color="neutral-4">
                          {hold.token.symbol}
                        </TokenSymbol>
                        <TokenMetric>
                          {' '}
                          {formatMarketCap(hold.token.marketCap)} ONE
                        </TokenMetric>
                      </TokenContent>
                    </TokenItem>
                  ))}
                </TokenListContent>
              </TokenList>
            )}

            {lastWinners.length > 0 && (
              <TokenList>
                <TokenTitle>Last Winners</TokenTitle>
                <TokenListContent>
                  {lastWinners.slice(0, 3).map((winner, index) => (
                    <TokenItem key={index}>
                      <TokenImageBanner>
                        <img
                          src={winner.token.uriData?.image}
                          alt={winner.token.name}
                        />
                      </TokenImageBanner>
                      <TokenContent>
                        <TokenName>{winner.token.name}</TokenName>
                        <TokenSymbol color="neutral-4">
                          {winner.token.symbol}
                        </TokenSymbol>
                        <TokenMetric>
                          {new Date(
                            Number(winner.timestamp) * 1000
                          ).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </TokenMetric>
                      </TokenContent>
                    </TokenItem>
                  ))}
                </TokenListContent>
              </TokenList>
            )}
          </TokenGrid>
        </div>
      </Box>
      <WidgetControls direction={'row'} gap={'16px'} align={'center'}>
        {isOwner && (
          <Box onClick={onDelete} style={{ opacity: '0.5' }}>
            <CloseCircle />
          </Box>
        )}
      </WidgetControls>
    </WidgetsContainer>
  )
}
