import React from 'react'
import styled from 'styled-components'
import { WidgetContainer } from './WidgetContainer'
import { WidgetBackground } from './WidgetBackground'
import { WidgetHead } from './WidgetHead'
import { WidgetLikes } from './WidgetLikes'

const ButtonBuy = styled.button`
  border-radius: 30px;
  background-color: #333333;
  color: white;
  padding: 4px 12px;
  border: none;
`

export const WidgetDirectSell = () => {
  return (
    <WidgetContainer>
      <WidgetBackground image='https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/6392641f-3a4d-44f0-8759-78548c771274/air-max-dawn-mens-shoes-Rg69GM.png' />
      <WidgetHead>
        <ButtonBuy>BUY</ButtonBuy>
        <WidgetLikes />
      </WidgetHead>
    </WidgetContainer>
  )
}
