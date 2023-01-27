import React from 'react'
import styled from 'styled-components'
import { AiFillHeart } from 'react-icons/ai'

const Wrapper = styled.div`
  background-color: rgba(255,255,255,0.5);
  border-radius: 10px;
  padding: 4px 4px;
  border: 1px solid rgb(202 202 202 / 50%);
  min-width: 50px;
  box-sizing: border-box;
`

export const WidgetLikes: React.FC = () => {
  return (
    <Wrapper>
      <AiFillHeart />
      <div>
        {Math.floor(Math.random() * 501)}
      </div>
    </Wrapper>
  )
}
