/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React from 'react'
import { AppBlockDiv } from './AppBlock.styles'

const AppBlock = (props) => {
  const { src, url, alt } = props

  const handleClick = () => {
    window.open(url, '_blank')
  }

  return (
    <AppBlockDiv>
      <img
        src={src}
        onClick={handleClick}
        alt={alt}
      />
    </AppBlockDiv>
  )
}

export default AppBlock
