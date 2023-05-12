import React from 'react'
import styled, { css, keyframes } from 'styled-components'
import { Button } from 'grommet/components/Button'
import { RecordStatus } from '../types'
import { Box } from 'grommet/components/Box'
import { Microphone } from 'grommet-icons/icons/Microphone'

export const pulseAnimation = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(255, 0, 0, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
  }
`

const StyledButton = styled(Button)<{ status: RecordStatus }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #00aee9;

  ${(props) => {
    if (props.status === 'recording') {
      return css`
        animation-name: ${pulseAnimation};
        animation-duration: 1.5s;
        animation-iteration-count: infinite;
        background-color: rgb(255, 0, 0);
      `
    }

    if (props.status === 'stopped') {
      return css`
        background-color: #00aee9;
      `
    }

    return ''
  }}
`

export const RecordButton: React.FC<{
  status: RecordStatus
  onClick: () => void
}> = ({ status, onClick }) => {
  return (
    <StyledButton status={status} justify="center" onClick={onClick}>
      <Box fill align="center" justify="center">
        <Microphone color="white" />
      </Box>
    </StyledButton>
  )
}
