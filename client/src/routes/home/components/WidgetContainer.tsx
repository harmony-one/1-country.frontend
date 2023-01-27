import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  min-height: 8.5em;
  height: 100%;
`

interface Props {
  children: React.ReactNode | React.ReactNode[]
}

export const WidgetContainer: React.FC<Props> = ({ children }) => {
  return <Container>{children}</Container>
}
