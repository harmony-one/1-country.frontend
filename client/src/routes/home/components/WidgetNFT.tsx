import React, {useCallback, useState} from 'react'
import styled from 'styled-components'
import { SlLock } from 'react-icons/sl'
import { WidgetContainer } from './WidgetContainer'
import { WidgetBackground } from './WidgetBackground'
import { WidgetHead } from './WidgetHead'
import { WidgetLikes } from './WidgetLikes'
import { useAccount } from "wagmi";
import {useWeb3Modal} from "@web3modal/react";

const LockWrapper = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.75);
  z-index: 2;
`

const Box = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  cursor: pointer;
`

interface LockProps {
  price: number
}

const Lock: React.FC<LockProps> = ({price}) => {
  return (
    <LockWrapper>
      <Box>
        <SlLock size="40px" color="white" />
        <div style={{marginTop: '8px'}}>Unlock for {price} ONE</div>
      </Box>
    </LockWrapper>
  );
}

interface Props {
  price: number,
  preview: string;
}

export const WidgetNFT: React.FC<Props> = ({preview, price}) => {
  const { isConnected } = useAccount()
  const { open } = useWeb3Modal()

  const [lock, setLock] = useState(true);
  const handleClick = useCallback(() => {

    if (!isConnected) {
      open({ route: 'ConnectWallet' })
      return
    }

    if (lock) {
      setLock(false);
      return;
    }

    window.open(preview, '_blank')
  }, [isConnected, open, lock]);

  return (
    <WidgetContainer onClick={handleClick}>
      <WidgetBackground image={preview} />
      {lock && <Lock price={price} />}
      <WidgetHead>
        <WidgetLikes />
      </WidgetHead>
    </WidgetContainer>
  )
}
