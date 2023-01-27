import React from 'react'
import { WidgetContainer } from './WidgetContainer'
import { WidgetBackground } from './WidgetBackground'
import { WidgetHead } from './WidgetHead'
import { WidgetLikes } from './WidgetLikes'

export const WidgetDirectSell = () => {
  return (
    <WidgetContainer>
      <a href='https://www.amazon.com/dp/B0BSP2HXQT'>
        <WidgetBackground image='https://static.wixstatic.com/media/b40d8c_5e0b10ec2fed43e397dfa0e4d7dfd19b~mv2.jpg/v1/fill/w_584,h_584,al_c,q_85,usm_0.66_1.00_0.01/b40d8c_5e0b10ec2fed43e397dfa0e4d7dfd19b~mv2.jpg' />

        <WidgetHead>
          <WidgetLikes />
        </WidgetHead>
      </a>
    </WidgetContainer>
  )
}
