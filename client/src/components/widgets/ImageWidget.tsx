import React, { useEffect, useState } from 'react'

import { DeleteWidgetButton, WidgetsContainer } from './Widgets.styles'
import { CloseCircle } from '../icons/CloseCircle'
import styled from 'styled-components'
import { Box } from 'grommet/components/Box'

interface Props {
  value: string
  isOwner?: boolean
  onDelete: () => void
}

const Container = styled.div`
  border: 1px solid rgb(207, 217, 222);
  overflow: hidden;
  border-radius: 12px;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  position: relative;
  display: block;
`

const StyledImage = styled.img`
  width: 100%;
  display: block;
  border-radius: 12px;
  overflow: hidden;
`

export const ImageWidget: React.FC<Props> = ({ value, isOwner, onDelete }) => {
  return (
    <WidgetsContainer style={{ paddingBottom: '2em', gap: '0' }}>
      {isOwner && (
        <Box align="end">
          <DeleteWidgetButton
            style={{ position: 'relative' }}
            onClick={onDelete}
          >
            <CloseCircle />
          </DeleteWidgetButton>
        </Box>
      )}
      <Container>
        <StyledImage src={value} />
      </Container>
    </WidgetsContainer>
  )
}
