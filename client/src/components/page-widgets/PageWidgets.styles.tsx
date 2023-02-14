import styled from 'styled-components'
import { FloatingText } from '../Controls'
import { StyledInput } from '../../routes/home/components/HomeSearchBlock'

export const PageWidgetContainer = styled.div`
  width: 100%;
  margin: 0 auto;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
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

export const WidgetStyledInput = styled(StyledInput)<{ valid: boolean }>`
  /* padding: 0.5em; */
  border: 2px solid ${(props) => (props.valid ? '#758796' : '#ff8c8c')};
  border-radius: 5px;
`

export const WidgetInputContainer = styled.div`
  border: 0px;
  margin-bottom: 1.5em;
  width: 80%;
  text-align: center;

  span {
    color: red;
  }
`
