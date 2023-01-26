import React from 'react'
import styled from 'styled-components'
import { WidgetContainer } from './WidgetContainer'
import { WidgetHead } from './WidgetHead'
import { WidgetLikes } from './WidgetLikes'

const TextContainer = styled.div`
  background-color: white;
  color: gray;
  border: none;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px;
`

export const WidgetUserText = () => {
  return (
    <WidgetContainer>
      <WidgetHead justify='flex-end'>
        <WidgetLikes />
      </WidgetHead>
      <TextContainer>
        <p>Facebook has 100 million active users in Africa</p>
      </TextContainer>
    </WidgetContainer>
  )
}
