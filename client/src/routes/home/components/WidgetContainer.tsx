import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  min-height: 8.5em;
  height: 100%;
  background-color: #ffffff;
`

interface Props {
  children: React.ReactNode | React.ReactNode[]
  onClick?: () => void
}

export const WidgetContainer: React.FC<Props> = ({
  children,
  onClick = () => undefined,
}) => {
  return <Container onClick={onClick}>{children}</Container>
}
