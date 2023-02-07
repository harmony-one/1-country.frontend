import styled from 'styled-components'
import { FloatingText } from '../Controls'

export const PageWidgetContainer = styled.div`
  width: 500px;
  display: flex;
  flex-direction: column;
  align-content: center;
`

export const AddWidgetContainter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5em;

  .addWidget {
    line-height: 0em;

    .add-button {
      cursor: pointer;
      border: 0px;
      background-color: inherit;
      font-size: 4rem;
    }
  }
  
`

export const AddWidgetForm = styled.div`
  display: flex;
  flex-direction: column;
  width: 400px;
  align-items: center;

  input {
    width: 100%;
    margin-top: 0em !important;
  }

`
export const FloatingTextInput = styled(FloatingText)`
  bottom: 16px !important;
`
