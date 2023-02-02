import React from 'react'
import styled from 'styled-components'
import { WidgetContainer } from './WidgetContainer'
import { WidgetHead } from './WidgetHead'
import { WidgetLikes } from './WidgetLikes'
import {WidgetItem, WidgetType} from "../../../stores/WidgetsStore";
import {Box} from "grommet";

const TextContainer = styled.div`
  background-color: transparent;
  color: ${props => props.color ? props.color : 'gray'};
  border: none;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px;
`

interface Props {
  widget: WidgetItem<WidgetType.TEXT>
}
export const WidgetText: React.FC<Props> = ({widget}) => {
  return (
    <WidgetContainer>
      <WidgetHead justify='flex-end'>
        <WidgetLikes />
      </WidgetHead>
      <Box fill background={{color: widget.get('bgColor')} || 'white'} align="center" justify="center" gap="8px">
        <TextContainer color={widget.get('textColor')}>
          {widget.get('text')}
        </TextContainer>
      </Box>
    </WidgetContainer>
  )
}
