import React, {useCallback, useState} from 'react'
import styled from 'styled-components'
import { SlLock } from 'react-icons/sl'
import { WidgetContainer } from './WidgetContainer'
import { WidgetBackground } from './WidgetBackground'
import { WidgetHead } from './WidgetHead'
import { WidgetLikes } from './WidgetLikes'

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
  onClick: () => void
}

const Lock: React.FC<LockProps> = ({onClick}) => {
  return (
    <LockWrapper onClick={onClick}>
      <Box>
        <SlLock size="40px" color="white" />
        <div style={{marginTop: '8px'}}>Unlock 100 ONE</div>
      </Box>
    </LockWrapper>
  );
}

export const WidgetNFT = () => {

  const [lock, setLock] = useState(true);
  const handleClickUnlock = useCallback(() => {
    setLock(false);
  }, []);

  return (
    <WidgetContainer>
      <WidgetBackground image='https://thumbor.forbes.com/thumbor/fit-in/900x510/https://www.forbes.com/advisor/in/wp-content/uploads/2022/03/monkey-g412399084_1280.jpg' />
      {lock && <Lock onClick={handleClickUnlock} />}
      <WidgetHead>
        <WidgetLikes />
      </WidgetHead>
    </WidgetContainer>
  )
}
