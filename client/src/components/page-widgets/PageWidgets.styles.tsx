import styled from 'styled-components'
import { FloatingText } from '../Controls'
import { StyledInput } from '../Inputs'

export const PageWidgetContainer = styled.div`
  width: 100%;
  margin: 0 auto 1em auto;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-content: center;
  gap: 12px;
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
  position: relative;
  border: 0;
  margin-bottom: 1.5em;
  width: 100%;
  max-width: 550px;
  text-align: center;

  span {
    color: red;
  }

  datalist {
    position: absolute;
    background-color: red !important; // white;
    border: 1px solid blue;
    border-radius: 0 0 5px 5px;
    border-top: none;
    font-family: sans-serif;
    width: 350px;
    padding: 5px;
    max-height: 10rem;
    overflow-y: auto;
  }

  option {
    background-color: white;
    padding: 4px;
    color: blue;
    margin-bottom: 1px;
    font-size: 18px;
    cursor: pointer;
  }

  option:hover,
  .active {
    background-color: lightblue;
  }
`
