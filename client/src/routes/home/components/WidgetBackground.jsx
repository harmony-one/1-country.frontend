import React from 'react'
import styled from 'styled-components'

const Background = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  background-image: ${props => `url(${props.image})` || 'palevioletred'};
  background-repeat: no-repeat;
  background-clip: content-box;
  background-position: center;
  background-size: cover;
`

export const WidgetBackground = ({ image }) => {
  return <Background image={image} />
}
