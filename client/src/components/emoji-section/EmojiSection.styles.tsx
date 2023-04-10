import styled, { css } from 'styled-components'
import { palette } from '../../constants'

export const EmojiSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  /* height: 2.5em; */
`

export const EmojiButton = styled.button<{
  iconColor?: string
  isProcessing?: boolean
}>`
  border: 0;
  display: flex;
  background-color: transparent;
  padding: 0.15em 0.15em 0.15em;
  cursor: pointer;
  align-items: center;
  font-size: 1.2rem;
  svg {
    font-size: 1.2rem;
    color: ${(props) => props.iconColor || palette.Purple};
  }

  span {
    padding-left: 0.2em;
    padding-top: 1.2em;
    font-size: 0.5rem;
    color: ${palette.default} !important;
    font-weight: 200;
  }

  ${(props) =>
    props.isProcessing &&
    css`
      background-color: ${palette.LightPurple};
      border: 1px solid ${palette.Purple};
      border-radius: 5px;
    `}
`
