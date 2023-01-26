import React from 'react'
import styled from 'styled-components'

const Head = styled.div`
  position: absolute;
  width: 100%;
  display: flex;
  justify-content: ${props => props.justify};
  padding: 12px;
  box-sizing: border-box;
`

export const WidgetHead = ({ children, justify = 'space-between' }) => {
  return (
    <Head justify={justify}>
      {children}
    </Head>
  )
}
