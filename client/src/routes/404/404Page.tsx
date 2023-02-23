import React from 'react'
import { GradientText } from '../../components/Text'
import { Box } from 'grommet/components/Box'
import styled from 'styled-components'

const StyledText = styled(GradientText)`
  font-size: 3em;
`

export const PageNotFound: React.FC = () => {
  return (
    <Box justify="center" align="center" height="100vh">
      <StyledText>404</StyledText>
      <GradientText>Page not found</GradientText>
    </Box>
  )
}
