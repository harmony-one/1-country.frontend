import React from 'react'
import { Box } from 'grommet/components/Box'
import { Skeleton } from 'grommet/components/Skeleton'
import styled from 'styled-components'

const StyledBox = styled(Box)`
  padding: 18px;
  border: 1px solid rgb(207, 217, 222);
  border-radius: 12px;
`

export const TwitterWidgetPlaceholder: React.FC = () => {
  return (
    <StyledBox fill="horizontal" direction="row" skeleton gap="24px">
      <Box>
        <Skeleton round="48px" width="48px" height="48px" />
      </Box>
      <Box fill="horizontal" gap="12px">
        <Skeleton round="12px" />
        <Skeleton round="12px" />
        <Skeleton round="12px" height="100px" />
        <Skeleton round="12px" />
        <Skeleton round="12px" />
      </Box>
    </StyledBox>
  )
}
