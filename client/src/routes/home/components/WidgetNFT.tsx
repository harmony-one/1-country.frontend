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
  onClick: () => void;
  price: number
}

const Lock: React.FC<LockProps> = ({onClick, price}) => {
  return (
    <LockWrapper onClick={onClick}>
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
  const handleClickUnlock = useCallback(() => {

    if (!isConnected) {
      open({ route: 'ConnectWallet' })
      return
    }

    setLock(false);
  }, [isConnected, open]);

  return (
    <WidgetContainer>
      <WidgetBackground image={preview} />
      {lock && <Lock price={price} onClick={handleClickUnlock} />}
      <WidgetHead>
        <WidgetLikes />
      </WidgetHead>
    </WidgetContainer>
  )
}
