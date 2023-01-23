import styled from 'styled-components'
import { FlexRow, FlexColumn } from '../Layout'

export const EmojisContainerRow = styled(FlexRow)`
  margin: auto;
  max-width: 550px !important;
  align-items: left;
  text-align: left;
  align-content: left;
  justify-items: center;
`
export const EmojiButton = styled.button`
  background-color: transparent;
  border: 0px;
  width: 5em;
`
export const EmojiCounterDiv = styled(FlexRow)`
  cursor: pointer;
  align-items: center;
  align-content: center;
  justify-content: center;
  justify-items: center;
`
export const EmojiLabelDiv = styled(FlexColumn)`
  cursor: pointer;
  padding-top: 0.2em;
  padding-bottom: 0.2em;
  align-items: center;
  align-content: center;
  justify-content: center;
  justify-items: center;
`
export const EmojisReactionRow = styled(FlexRow)`
  margin-top: 1em;
  border-top: 1px solid #bdbdbd;
  border-bottom: 1px solid #bdbdbd;
  align-items: center;
  align-content: center;
  justify-content: center;
  justify-items: center;
`

export const EmojiDescriptionDiv = styled.div`
  border-top: 1px solid red !important;
  border-bottom: 1px solid red !important;
`
