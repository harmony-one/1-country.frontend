import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  border-radius: 30px;
  overflow: hidden;
  position: relative;
  min-height: 8.5em;
`

export const WidgetContainer = ({ children }) => {
  return <Container>{children}</Container>
}
