import React from 'react'
import styled from 'styled-components'
import { WidgetsContainer } from './Widgets.styles'
import { observer } from 'mobx-react-lite'
import { useStores } from '../../stores'

const Container = styled(WidgetsContainer)`
  border: none;
  border-radius: unset;
  padding: 12px;
  box-sizing: border-box;
  cursor: pointer;
  align-items: center;
`

const IconImg = styled.img``

interface Props {}

export const MetamaskWidget: React.FC<Props> = observer(() => {
  const { walletStore } = useStores()
  const handleClick = () => {
    walletStore.connect()
  }
  return (
    <Container onClick={handleClick}>
      <IconImg src="/images/metamaskFox.svg" height="60px" width="60px" />
    </Container>
  )
})
