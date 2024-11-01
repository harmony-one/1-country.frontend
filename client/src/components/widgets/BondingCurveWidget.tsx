import React, { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { Box } from 'grommet/components/Box'
import { Text } from 'grommet/components/Text'
import { TokenInfoWithPrice } from '../../api/bonding-curve/bondingCurveContractClient'
import { useStores } from '../../stores'
import { formatEther } from 'viem'
import { MemeTokenContainer, WidgetsContainer } from './Widgets.styles'

interface Props {
  value: string
  isPinned: boolean
  isOwner?: boolean
  onPin: (isPinned: boolean) => void
  onDelete: () => void
}

export const BondingCurveWidget: React.FC<{ token: TokenInfoWithPrice }> = ({
  token,
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [balance, setBalance] = useState<bigint>()
  const { walletStore, rootStore } = useStores()
  let value = '0'

  const { ref, inView } = useInView({
    /* Optional options */
    rootMargin: '0px',
    root: null,
    triggerOnce: true,
    threshold: 0.1,
  })

  useEffect(() => {
    const getBalance = async () => {
      try {
        const data = await rootStore.bondingCurveClient.tokens.getBalance(
          token.tokenAddress,
          walletStore.walletAddress
        )
        setBalance(data)
      } catch (error) {
        console.error('Error fetching balance:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (walletStore.walletAddress) {
      getBalance()
    }
  }, [
    token.tokenAddress,
    walletStore.walletAddress,
    rootStore.bondingCurveClient,
  ])

  if (balance && token.currentPrice) {
    const balanceBigInt = BigInt(balance.toString())
    const currentPriceBigInt = BigInt(token.currentPrice.toString())
    const calculatedValue = balanceBigInt * currentPriceBigInt
    value = formatEther(calculatedValue)
  }

  const formattedBalance = balance ? balance.toString() : '0'

  if (isLoading)
    return (
      <Box
        background="light-2"
        height="xxsmall"
        width="80%"
        round="small"
        animation="pulse"
      />
    )

  return (
    <WidgetsContainer isWidgetLoading={isLoading} ref={ref}>
      <MemeTokenContainer>
        <Text weight="normal" color="dark-1">
          {token.name} ({token.symbol})
        </Text>
        <Box align="end">
          <Text size="small">{formattedBalance}</Text>
          <Text size="xsmall" color="dark-3">
            {value} ONE
          </Text>
        </Box>
      </MemeTokenContainer>
    </WidgetsContainer>
  )
}
