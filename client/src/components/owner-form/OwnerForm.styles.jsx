import styled from 'styled-components'
import { FloatingText } from '../Controls'

export const OwnerFormContainer = styled.div`
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  align-items: center;

  input {
    width: 100%;
    margin-top: 0em !important;
  }

  /* button {
    margin-top: 1em;
  } */
`
export const FloatingTextInput = styled(FloatingText)`
  bottom: 16px !important;
`
